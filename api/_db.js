import { createClient } from '@libsql/client';
import { DEFAULT_PROJECTS, DEFAULT_SETTINGS, SAMPLE_LEADS } from '../data/initial-data.js';

let client = null;
let initialized = false;

export function getDb() {
    if (!client) {
        const url = process.env.TURSO_DATABASE_URL || 'file:grafrika.db';
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

    // SEED INITIAL SI TABLES VIDES
    const projectCount = await db.execute('SELECT COUNT(*) as count FROM projects;');
    if (Number(projectCount.rows[0].count) === 0) {
        for (const proj of DEFAULT_PROJECTS) {
            await db.execute({
                sql: `INSERT INTO projects (id, title, category, location, surface, duration, description, photos)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
                args: [
                    proj.id,
                    proj.title,
                    proj.category,
                    proj.location,
                    proj.surface,
                    proj.duration,
                    proj.description,
                    JSON.stringify(proj.photos)
                ]
            });
        }
    }

    const leadCount = await db.execute('SELECT COUNT(*) as count FROM leads;');
    if (Number(leadCount.rows[0].count) === 0) {
        for (const lead of SAMPLE_LEADS) {
            await db.execute({
                sql: `INSERT INTO leads (id, name, phone, domain, city, message, status, date)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
                args: [
                    lead.id,
                    lead.name,
                    lead.phone,
                    lead.domain,
                    lead.city,
                    lead.message,
                    lead.status,
                    lead.date
                ]
            });
        }
    }

    const settingsCount = await db.execute("SELECT COUNT(*) as count FROM settings WHERE id = 'default';");
    if (Number(settingsCount.rows[0].count) === 0) {
        await db.execute({
            sql: `INSERT INTO settings (id, data) VALUES ('default', ?);`,
            args: [JSON.stringify(DEFAULT_SETTINGS)]
        });
    }

    const statsCount = await db.execute("SELECT COUNT(*) as count FROM stats WHERE id = 'default';");
    if (Number(statsCount.rows[0].count) === 0) {
        await db.execute(`INSERT INTO stats (id, views, whatsapp, leads) VALUES ('default', 248, 39, 12);`);
    }

    initialized = true;
}
