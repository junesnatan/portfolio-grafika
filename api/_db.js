import mysql from 'mysql2/promise';
import { createClient } from '@libsql/client';
import { DEFAULT_PROJECTS, DEFAULT_SETTINGS, SAMPLE_LEADS } from '../data/initial-data.js';

let client = null;
let initialized = false;

export function isUsingMySQL() {
    return Boolean(
        process.env.MYSQL_URL ||
        (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('mysql://')) ||
        process.env.MYSQL_HOST
    );
}

function createMySqlAdapter() {
    const rawUrl = process.env.MYSQL_URL || (process.env.DATABASE_URL?.startsWith('mysql://') ? process.env.DATABASE_URL : null);
    let poolConfig = {};

    if (rawUrl) {
        // Nettoyage de l'URL pour mysql2
        const cleanUrl = rawUrl.replace(/^mysql2:\/\//, 'mysql://');
        poolConfig = { uri: cleanUrl };
    } else {
        poolConfig = {
            host: process.env.MYSQL_HOST || 'localhost',
            port: Number(process.env.MYSQL_PORT || 3306),
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            database: process.env.MYSQL_DATABASE || 'atelier_grafrika'
        };
    }

    // Activation automatique du SSL pour les bases cloud (TiDB, Aiven, Railway, PlanetScale, etc.)
    const sslEnv = process.env.MYSQL_SSL;
    const isCloudHost = Boolean(
        (rawUrl && (rawUrl.includes('tidbcloud') || rawUrl.includes('aiven') || rawUrl.includes('railway') || rawUrl.includes('ssl=true'))) ||
        (process.env.MYSQL_HOST && (process.env.MYSQL_HOST.includes('tidb') || process.env.MYSQL_HOST.includes('aiven') || process.env.MYSQL_HOST.includes('railway')))
    );

    if (sslEnv === 'true' || (sslEnv !== 'false' && isCloudHost)) {
        poolConfig.ssl = { rejectUnauthorized: false };
    }

    poolConfig.waitForConnections = true;
    poolConfig.connectionLimit = 10;
    poolConfig.queueLimit = 0;
    poolConfig.enableKeepAlive = true;
    poolConfig.keepAliveInitialDelay = 10000;

    const pool = mysql.createPool(poolConfig);

    return {
        isMySQL: true,
        async execute(queryOrObj) {
            let sql = typeof queryOrObj === 'string' ? queryOrObj : queryOrObj.sql;
            let args = (typeof queryOrObj === 'object' && queryOrObj.args) ? queryOrObj.args : [];

            // Traduction de compatibilité SQLite -> MySQL (ON CONFLICT -> ON DUPLICATE KEY)
            if (sql.includes('ON CONFLICT')) {
                sql = sql.replace(/ON CONFLICT\s*\([^)]+\)\s*DO UPDATE SET/gi, 'ON DUPLICATE KEY UPDATE');
                sql = sql.replace(/excluded\.(\w+)/gi, 'VALUES($1)');
            }

            const [rows] = await pool.query(sql, args);
            return {
                rows: Array.isArray(rows) ? rows : [],
                affectedRows: rows?.affectedRows || 0,
                insertId: rows?.insertId || null
            };
        }
    };
}

export function getDb() {
    if (!client) {
        if (isUsingMySQL()) {
            client = createMySqlAdapter();
        } else {
            // Fallback SQLite / Turso local ou distant
            const defaultLocalDb = (typeof process !== 'undefined' && process.env && process.env.VERCEL)
                ? 'file:/tmp/grafrika.db'
                : 'file:grafrika.db';
            const url = process.env.TURSO_DATABASE_URL || defaultLocalDb;
            const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

            const libsql = createClient({ url, authToken });
            client = {
                isMySQL: false,
                execute(q) {
                    return libsql.execute(q);
                }
            };
        }
    }
    return client;
}

export async function initDb() {
    if (initialized) return;
    const db = getDb();

    if (db.isMySQL) {
        // =====================================================================
        // SCHÉMA MYSQL 8.0 (OPTIMISÉ UTF8MB4 & INNODB)
        // =====================================================================
        await db.execute(`
            CREATE TABLE IF NOT EXISTS projects (
                id VARCHAR(64) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                category VARCHAR(100) NOT NULL,
                location VARCHAR(255) NOT NULL,
                surface VARCHAR(100),
                duration VARCHAR(100),
                description TEXT,
                photos LONGTEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS leads (
                id VARCHAR(64) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                phone VARCHAR(50) NOT NULL,
                domain VARCHAR(150),
                city VARCHAR(150),
                message TEXT,
                status VARCHAR(50) DEFAULT 'Nouveau',
                date VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS settings (
                id VARCHAR(64) PRIMARY KEY,
                data LONGTEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS stats (
                id VARCHAR(64) PRIMARY KEY,
                views INT DEFAULT 248,
                whatsapp INT DEFAULT 39,
                leads INT DEFAULT 12
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS auth (
                id VARCHAR(64) PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS visitor_logs (
                id VARCHAR(64) PRIMARY KEY,
                visitor_id VARCHAR(64) NOT NULL,
                event_type VARCHAR(50) NOT NULL DEFAULT 'pageview',
                page VARCHAR(255) DEFAULT '/',
                referrer VARCHAR(255) DEFAULT 'Direct',
                source_category VARCHAR(50) DEFAULT 'Direct',
                device_type VARCHAR(50) DEFAULT 'Mobile',
                browser VARCHAR(50),
                os VARCHAR(50),
                metadata TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
    } else {
        // =====================================================================
        // SCHÉMA SQLITE (POUR FALLBACK LOCAL)
        // =====================================================================
        await db.execute(`
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                location TEXT NOT NULL,
                surface TEXT,
                duration TEXT,
                description TEXT,
                photos TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS leads (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT,
                phone TEXT NOT NULL,
                domain TEXT,
                city TEXT,
                message TEXT,
                status TEXT DEFAULT 'Nouveau',
                date TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS settings (
                id TEXT PRIMARY KEY,
                data TEXT NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS stats (
                id TEXT PRIMARY KEY,
                views INTEGER DEFAULT 248,
                whatsapp INTEGER DEFAULT 39,
                leads INTEGER DEFAULT 12
            );
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS auth (
                id TEXT PRIMARY KEY,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS visitor_logs (
                id TEXT PRIMARY KEY,
                visitor_id TEXT NOT NULL,
                event_type TEXT NOT NULL DEFAULT 'pageview',
                page TEXT DEFAULT '/',
                referrer TEXT DEFAULT 'Direct',
                source_category TEXT DEFAULT 'Direct',
                device_type TEXT DEFAULT 'Mobile',
                browser TEXT,
                os TEXT,
                metadata TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await db.execute(`CREATE INDEX IF NOT EXISTS idx_vlogs_created ON visitor_logs(created_at);`);
        await db.execute(`CREATE INDEX IF NOT EXISTS idx_vlogs_event ON visitor_logs(event_type);`);
    }

    // Initialisation des données par défaut si absentes
    const settingsCount = await db.execute("SELECT COUNT(*) as count FROM settings WHERE id = 'default';");
    const countVal = Number(settingsCount.rows[0]?.count || 0);
    if (countVal === 0) {
        await db.execute({
            sql: `INSERT INTO settings (id, data) VALUES ('default', ?);`,
            args: [JSON.stringify(DEFAULT_SETTINGS)]
        });
    }

    const statsCount = await db.execute("SELECT COUNT(*) as count FROM stats WHERE id = 'default';");
    const sCount = Number(statsCount.rows[0]?.count || 0);
    if (sCount === 0) {
        await db.execute(`INSERT INTO stats (id, views, whatsapp, leads) VALUES ('default', 0, 0, 0);`);
    }

    // Initialisation d'échantillons de démonstration réalistes pour le journal de trafic si vide
    try {
        const logsCount = await db.execute("SELECT COUNT(*) as count FROM visitor_logs;");
        const lCount = Number(logsCount.rows[0]?.count || 0);
        if (lCount === 0) {
            const seedLogs = [
                { id: 'log-1', vid: 'v_user_01', type: 'pageview', ref: 'https://www.google.com/', src: 'Google Search', dev: 'Mobile', browser: 'Chrome Mobile', os: 'Android', meta: '', ago: 10 },
                { id: 'log-2', vid: 'v_user_01', type: 'project_view', ref: '', src: 'Google Search', dev: 'Mobile', browser: 'Chrome Mobile', os: 'Android', meta: 'Villa Duplex Moderne', ago: 12 },
                { id: 'log-3', vid: 'v_user_01', type: 'whatsapp_click', ref: '', src: 'Google Search', dev: 'Mobile', browser: 'Chrome Mobile', os: 'Android', meta: 'Contact WhatsApp Portfolio', ago: 15 },
                { id: 'log-4', vid: 'v_user_02', type: 'pageview', ref: 'https://www.tiktok.com/', src: 'TikTok', dev: 'Mobile', browser: 'TikTok App', os: 'iOS', meta: '', ago: 45 },
                { id: 'log-5', vid: 'v_user_02', type: 'project_view', ref: '', src: 'TikTok', dev: 'Mobile', browser: 'TikTok App', os: 'iOS', meta: 'Clôture & Aménagement', ago: 48 },
                { id: 'log-6', vid: 'v_user_03', type: 'pageview', ref: 'Direct', src: 'Accès Direct', dev: 'Ordinateur', browser: 'Chrome', os: 'Windows', meta: '', ago: 120 },
                { id: 'log-7', vid: 'v_user_04', type: 'pageview', ref: 'https://www.instagram.com/', src: 'Instagram', dev: 'Mobile', browser: 'Instagram App', os: 'Android', meta: '', ago: 180 },
                { id: 'log-8', vid: 'v_user_04', type: 'whatsapp_click', ref: '', src: 'Instagram', dev: 'Mobile', browser: 'Instagram App', os: 'Android', meta: 'Contact WhatsApp Portfolio', ago: 185 },
                { id: 'log-9', vid: 'v_user_05', type: 'pageview', ref: 'https://www.facebook.com/', src: 'Facebook', dev: 'Mobile', browser: 'Facebook App', os: 'Android', meta: '', ago: 240 },
                { id: 'log-10', vid: 'v_user_06', type: 'pageview', ref: 'https://www.google.bj/', src: 'Google Search', dev: 'Ordinateur', browser: 'Edge', os: 'Windows', meta: '', ago: 360 }
            ];

            for (const item of seedLogs) {
                const dateIso = new Date(Date.now() - item.ago * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19);
                await db.execute({
                    sql: `INSERT INTO visitor_logs (id, visitor_id, event_type, page, referrer, source_category, device_type, browser, os, metadata, created_at) VALUES (?, ?, ?, '/', ?, ?, ?, ?, ?, ?, ?);`,
                    args: [item.id, item.vid, item.type, item.ref, item.src, item.dev, item.browser, item.os, item.meta, dateIso]
                });
            }
        }
    } catch (e) {
        console.warn('Init visitor_logs seed notice:', e.message);
    }

    initialized = true;
}
