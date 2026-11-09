import { createClient } from '@libsql/client';
import { DEFAULT_PROJECTS, DEFAULT_SETTINGS, SAMPLE_LEADS } from '../data/initial-data.js';

let client = null;
let initialized = false;

export function getDb() {
    if (!client) {
        const defaultLocalDb = (typeof process !== 'undefined' && process.env && process.env.VERCEL)
            ? 'file:/tmp/grafrika.db'
            : 'file:grafrika.db';
        const url = process.env.TURSO_DATABASE_URL || defaultLocalDb;
        const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

        client = createClient({
            url,
            authToken
        });
    }
    return client;
}

export async function initDb() {
    if (initialized) return;
    const db = getDb();

    // 1. Table projects
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

    // 2. Table leads
    await db.execute(`
        CREATE TABLE IF NOT EXISTS leads (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            domain TEXT,
            city TEXT,
            message TEXT,
            status TEXT DEFAULT 'Nouveau',
            date TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // 3. Table settings
    await db.execute(`
        CREATE TABLE IF NOT EXISTS settings (
            id TEXT PRIMARY KEY,
            data TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // 4. Table stats
    await db.execute(`
        CREATE TABLE IF NOT EXISTS stats (
            id TEXT PRIMARY KEY,
            views INTEGER DEFAULT 248,
            whatsapp INTEGER DEFAULT 39,
            leads INTEGER DEFAULT 12
        );
    `);

    // 5. Table auth
    await db.execute(`
        CREATE TABLE IF NOT EXISTS auth (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Purge de tout vestige de projets ou leads fictifs / démo
    await db.execute("DELETE FROM projects WHERE id IN ('proj-1', 'proj-2', 'proj-3', 'proj-4', 'proj-5', 'proj-6', 'proj-7', '1', '2', '3', '4', '5', '6', '7');");
    await db.execute("DELETE FROM leads WHERE id IN ('lead-1', 'lead-2', 'lead-3', '101', '102', '103', '104');");

    const settingsCount = await db.execute("SELECT COUNT(*) as count FROM settings WHERE id = 'default';");
    if (Number(settingsCount.rows[0].count) === 0) {
        await db.execute({
            sql: `INSERT INTO settings (id, data) VALUES ('default', ?);`,
            args: [JSON.stringify(DEFAULT_SETTINGS)]
        });
    } else {
        const cur = await db.execute("SELECT data FROM settings WHERE id = 'default' LIMIT 1;");
        if (cur.rows.length > 0 && cur.rows[0].data) {
            const parsed = typeof cur.rows[0].data === 'string' ? JSON.parse(cur.rows[0].data) : cur.rows[0].data;
            if (!parsed.whatsapp || parsed.whatsapp.includes('00 00 00') || (parsed.email && parsed.email.includes('contact@ateliergrafrika.com')) || !parsed.tiktok || !parsed.tiktok.includes('@atelier.grafrika')) {
                await db.execute({
                    sql: `UPDATE settings SET data = ? WHERE id = 'default';`,
                    args: [JSON.stringify(DEFAULT_SETTINGS)]
                });
            }
        }
    }

    const statsCount = await db.execute("SELECT COUNT(*) as count FROM stats WHERE id = 'default';");
    if (Number(statsCount.rows[0].count) === 0) {
        await db.execute(`INSERT INTO stats (id, views, whatsapp, leads) VALUES ('default', 0, 0, 0);`);
    }

    initialized = true;
}
