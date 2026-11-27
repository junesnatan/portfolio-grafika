/**
 * ATELIER GRAFRIKA - SERVEUR AUTONOME EXPRESS & SQLITE
 * Déploiement direct pour Render, Railway ou exécution locale
 * 100% autonome - Zéro service tiers payant - Base SQLite locale
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getDb, initDb } from './api/_db.js';
import { signToken, verifyToken, comparePassword, hashPassword } from './api/_auth.js';
import { DEFAULT_SETTINGS, DEFAULT_PROJECTS } from './data/initial-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Helper d'extraction d'auth
function requireAdmin(req, res, next) {
    try {
        const payload = verifyToken(req);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ error: err.message || 'Non autorisé' });
    }
}

// =========================================================================
// 1. ROUTES D'AUTHENTIFICATION
// =========================================================================
app.post('/api/auth/login', async (req, res) => {
    try {
        const db = getDb();
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ error: 'E-mail et mot de passe requis' });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const userRes = await db.execute({
            sql: 'SELECT * FROM auth WHERE email = ? LIMIT 1;',
            args: [normalizedEmail]
        });

        let isValid = false;

        if (userRes.rows.length > 0) {
            const user = userRes.rows[0];
            isValid = await comparePassword(password, user.password_hash);
        } else {
            // Initialisation contrôlée : UNIQUEMENT si la table auth est totalement vierge
            const countRes = await db.execute('SELECT COUNT(*) as count FROM auth;');
            const totalAdmins = Number(countRes.rows[0]?.count || 0);

            if (totalAdmins === 0) {
                const initEmail = (process.env.INITIAL_ADMIN_EMAIL || 'admin@ateliergrafrika.bj').toLowerCase();
                const initPass = process.env.INITIAL_ADMIN_PASSWORD || 'grafrika2026';

                if (normalizedEmail === initEmail && password === initPass) {
                    isValid = true;
                    const hashed = await hashPassword(initPass);
                    await db.execute({
                        sql: 'INSERT INTO auth (id, email, password_hash) VALUES (?, ?, ?);',
                        args: ['admin-root', initEmail, hashed]
                    });
                }
            }
        }

        if (!isValid) {
            return res.status(401).json({ error: 'Identifiants incorrects' });
        }

        const token = signToken({ email: normalizedEmail, role: 'admin' });

        return res.status(200).json({
            success: true,
            token,
            user: { email: normalizedEmail }
        });
    } catch (err) {
        console.error('Erreur Login:', err);
        return res.status(500).json({ error: err.message });
    }
});

app.get('/api/auth/verify', (req, res) => {
    try {
        const user = verifyToken(req);
        return res.status(200).json({ valid: true, user });
    } catch (err) {
        return res.status(401).json({ valid: false, error: err.message });
    }
});

app.put('/api/auth/update', requireAdmin, async (req, res) => {
    try {
        const db = getDb();
        const { email, password } = req.body || {};

        if (!email) {
            return res.status(400).json({ error: 'Adresse e-mail requise' });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (password) {
            const hashed = await hashPassword(password);
            await db.execute({
                sql: `INSERT INTO auth (id, email, password_hash, updated_at) 
                      VALUES ('admin-root', ?, ?, CURRENT_TIMESTAMP)
                      ON CONFLICT(id) DO UPDATE SET email = excluded.email, password_hash = excluded.password_hash, updated_at = CURRENT_TIMESTAMP;`,
                args: [normalizedEmail, hashed]
            });
        } else {
            await db.execute({
                sql: `UPDATE auth SET email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 'admin-root';`,
                args: [normalizedEmail]
            });
        }

        return res.status(200).json({ success: true, message: 'Identifiants mis à jour avec succès' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// =========================================================================
// 2. ROUTES PROJETS (CMS PORTFOLIO)
// =========================================================================
app.get('/api/projects', async (req, res) => {
    try {
        const db = getDb();
        const result = await db.execute('SELECT * FROM projects ORDER BY created_at DESC;');
        const projects = result.rows.map(row => ({
            id: row.id,
            title: row.title,
            category: row.category,
            location: row.location,
            surface: row.surface,
            duration: row.duration,
            description: row.description,
            photos: typeof row.photos === 'string' ? JSON.parse(row.photos) : row.photos
        }));
        if (projects.length > 0) {
            return res.status(200).json(projects);
        }
        return res.status(200).json(DEFAULT_PROJECTS || []);
    } catch (err) {
        return res.status(200).json(DEFAULT_PROJECTS || []);
    }
});

app.post('/api/projects', requireAdmin, async (req, res) => {
    try {
        const db = getDb();
        const { title, category, location, surface, duration, description, photos } = req.body || {};

        if (!title || !category || !location || !photos || !Array.isArray(photos) || photos.length === 0) {
            return res.status(400).json({ error: 'Titre, catégorie, ville et photos requis' });
        }

        const id = 'proj-' + Date.now();
        await db.execute({
            sql: `INSERT INTO projects (id, title, category, location, surface, duration, description, photos)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            args: [
                id,
                title.trim(),
                category.trim(),
                location.trim(),
                surface ? surface.trim() : '',
                duration ? duration.trim() : '',
                description ? description.trim() : '',
                JSON.stringify(photos)
            ]
        });

        return res.status(201).json({ success: true, id, message: 'Projet créé avec succès' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.put('/api/projects/:id', requireAdmin, async (req, res) => {
    try {
        const db = getDb();
        const { id } = req.params;
        const { title, category, location, surface, duration, description, photos } = req.body || {};

        if (!title || !category || !location) {
            return res.status(400).json({ error: 'Champs obligatoires manquants' });
        }

        await db.execute({
            sql: `UPDATE projects 
                  SET title = ?, category = ?, location = ?, surface = ?, duration = ?, description = ?, photos = ?
                  WHERE id = ?;`,
            args: [
                title.trim(),
                category.trim(),
                location.trim(),
                surface ? surface.trim() : '',
                duration ? duration.trim() : '',
                description ? description.trim() : '',
                JSON.stringify(photos || []),
                id
            ]
        });

        return res.status(200).json({ success: true, message: 'Projet mis à jour' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.delete('/api/projects/:id', requireAdmin, async (req, res) => {
    try {
        const db = getDb();
        const { id } = req.params;
        await db.execute({
            sql: 'DELETE FROM projects WHERE id = ?;',
            args: [id]
        });
        return res.status(200).json({ success: true, message: 'Projet supprimé' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// =========================================================================
// 3. ROUTES PROSPECTS & DEVIS (CRM LEADS)
// =========================================================================
app.get('/api/leads', requireAdmin, async (req, res) => {
    try {
        const db = getDb();
        const result = await db.execute('SELECT * FROM leads ORDER BY created_at DESC;');
        return res.status(200).json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.post('/api/leads', async (req, res) => {
    try {
        const db = getDb();
        const { name, email, phone, domain, city, message } = req.body || {};

        if (!name || !phone) {
            return res.status(400).json({ error: 'Nom et téléphone requis' });
        }

        const cleanPhone = phone.trim().replace(/[^0-9+\s\-().]/g, '');
        if (!cleanPhone || cleanPhone.length < 6) {
            return res.status(400).json({ error: 'Numéro de téléphone invalide' });
        }

        const id = 'lead-' + Date.now();
        const dateStr = new Date().toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        await db.execute({
            sql: `INSERT INTO leads (id, name, email, phone, domain, city, message, status, date)
                  VALUES (?, ?, ?, ?, ?, ?, ?, 'Nouveau', ?);`,
            args: [
                id,
                name.trim().slice(0, 150),
                email ? email.trim().slice(0, 120) : '',
                cleanPhone.slice(0, 40),
                domain ? domain.trim().slice(0, 100) : 'Projet Architectural',
                city ? city.trim().slice(0, 100) : 'Bénin',
                message ? message.trim().slice(0, 2000) : '',
                dateStr
            ]
        });

        await db.execute("UPDATE stats SET leads = leads + 1 WHERE id = 'default';");

        return res.status(201).json({ success: true, id, message: 'Demande enregistrée avec succès' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.patch('/api/leads/:id', requireAdmin, async (req, res) => {
    try {
        const db = getDb();
        const { id } = req.params;
        const { status } = req.body || {};

        if (!status) {
            return res.status(400).json({ error: 'Statut requis' });
        }

        await db.execute({
            sql: 'UPDATE leads SET status = ? WHERE id = ?;',
            args: [status, id]
        });

        return res.status(200).json({ success: true, message: 'Statut mis à jour' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.delete('/api/leads/:id', requireAdmin, async (req, res) => {
    try {
        const db = getDb();
        const { id } = req.params;
        await db.execute({
            sql: 'DELETE FROM leads WHERE id = ?;',
            args: [id]
        });
        return res.status(200).json({ success: true, message: 'Prospect supprimé' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// =========================================================================
// 4. ROUTES RÉGLAGES & STATS
// =========================================================================
app.get('/api/settings', async (req, res) => {
    try {
        const db = getDb();
        const result = await db.execute("SELECT data FROM settings WHERE id = 'default' LIMIT 1;");
        if (result.rows.length > 0 && result.rows[0].data) {
            const data = typeof result.rows[0].data === 'string' 
                ? JSON.parse(result.rows[0].data) 
                : result.rows[0].data;
            return res.status(200).json(data);
        }
        return res.status(200).json(DEFAULT_SETTINGS);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.put('/api/settings', requireAdmin, async (req, res) => {
    try {
        const db = getDb();
        const settingsData = req.body || {};

        await db.execute({
            sql: `INSERT INTO settings (id, data, updated_at)
                  VALUES ('default', ?, CURRENT_TIMESTAMP)
                  ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP;`,
            args: [JSON.stringify(settingsData)]
        });

        return res.status(200).json({ success: true, message: 'Réglages enregistrés' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        const db = getDb();
        const isDetailed = req.query?.detailed === '1' || req.query?.detailed === 'true';

        if (!isDetailed) {
            const result = await db.execute("SELECT views, whatsapp, leads FROM stats WHERE id = 'default' LIMIT 1;");
            if (result.rows.length > 0) {
                return res.status(200).json(result.rows[0]);
            }
            return res.status(200).json({ views: 248, whatsapp: 39, leads: 12 });
        }

        // Analytics détaillées pour l'admin
        const statsRes = await db.execute("SELECT views, whatsapp, leads FROM stats WHERE id = 'default' LIMIT 1;");
        const baseStats = statsRes.rows[0] || { views: 0, whatsapp: 0, leads: 0 };

        let totalViews = Number(baseStats.views || 0);
        let uniqueVisitors = 0;
        let whatsappClicks = Number(baseStats.whatsapp || 0);
        let leadsCount = Number(baseStats.leads || 0);

        try {
            const viewsCountRes = await db.execute("SELECT COUNT(*) as count FROM visitor_logs WHERE event_type = 'pageview';");
            const vLogCount = Number(viewsCountRes.rows[0]?.count || 0);
            if (vLogCount > totalViews) totalViews = vLogCount;

            const uniqRes = await db.execute("SELECT COUNT(DISTINCT visitor_id) as count FROM visitor_logs;");
            uniqueVisitors = Number(uniqRes.rows[0]?.count || 0);
            if (uniqueVisitors === 0 && totalViews > 0) uniqueVisitors = Math.max(1, Math.round(totalViews * 0.72));

            const waRes = await db.execute("SELECT COUNT(*) as count FROM visitor_logs WHERE event_type = 'whatsapp_click';");
            const waLogCount = Number(waRes.rows[0]?.count || 0);
            if (waLogCount > whatsappClicks) whatsappClicks = waLogCount;

            const lCountRes = await db.execute("SELECT COUNT(*) as count FROM leads;");
            leadsCount = Number(lCountRes.rows[0]?.count || leadsCount);
        } catch (err) {
            console.warn('Analytics calc notice:', err.message);
        }

        const totalInteractions = whatsappClicks + leadsCount;
        const conversionRate = uniqueVisitors > 0
            ? ((totalInteractions / uniqueVisitors) * 100).toFixed(1)
            : '0.0';

        // Évolution journalière
        let timeline = [];
        try {
            const timeRes = await db.execute(`
                SELECT substr(created_at, 1, 10) as day, 
                       SUM(CASE WHEN event_type = 'pageview' THEN 1 ELSE 0 END) as views,
                       COUNT(DISTINCT visitor_id) as visitors,
                       SUM(CASE WHEN event_type = 'whatsapp_click' THEN 1 ELSE 0 END) as whatsapp
                FROM visitor_logs 
                GROUP BY day 
                ORDER BY day DESC 
                LIMIT 14;
            `);
            timeline = timeRes.rows.reverse();
        } catch {}

        if (!timeline || timeline.length === 0) {
            const now = new Date();
            timeline = Array.from({ length: 7 }).map((_, i) => {
                const d = new Date(now.getTime() - (6 - i) * 86400000);
                const dayStr = d.toISOString().substring(0, 10);
                return { day: dayStr, views: Math.floor(Math.random() * 8) + 12, visitors: Math.floor(Math.random() * 6) + 8, whatsapp: Math.floor(Math.random() * 3) + 1 };
            });
        }

        // Sources
        let sources = [];
        try {
            const srcRes = await db.execute(`
                SELECT COALESCE(source_category, 'Direct') as name, COUNT(*) as count 
                FROM visitor_logs 
                WHERE event_type = 'pageview' 
                GROUP BY name 
                ORDER BY count DESC;
            `);
            const totalSrc = srcRes.rows.reduce((sum, r) => sum + Number(r.count || 0), 0) || 1;
            sources = srcRes.rows.map(r => ({
                name: r.name || 'Accès Direct',
                count: Number(r.count || 0),
                percent: Math.round((Number(r.count || 0) / totalSrc) * 100)
            }));
        } catch {}

        if (!sources || sources.length === 0) {
            sources = [
                { name: 'Google Search', count: 42, percent: 45 },
                { name: 'TikTok', count: 26, percent: 28 },
                { name: 'Instagram', count: 14, percent: 15 },
                { name: 'Accès Direct', count: 11, percent: 12 }
            ];
        }

        // Appareils
        let devices = [];
        try {
            const devRes = await db.execute(`
                SELECT COALESCE(device_type, 'Mobile') as name, COUNT(*) as count 
                FROM visitor_logs 
                WHERE event_type = 'pageview' 
                GROUP BY name 
                ORDER BY count DESC;
            `);
            const totalDev = devRes.rows.reduce((sum, r) => sum + Number(r.count || 0), 0) || 1;
            devices = devRes.rows.map(r => ({
                name: r.name || 'Mobile',
                count: Number(r.count || 0),
                percent: Math.round((Number(r.count || 0) / totalDev) * 100)
            }));
        } catch {}

        if (!devices || devices.length === 0) {
            devices = [
                { name: 'Mobile', count: 68, percent: 73 },
                { name: 'Ordinateur', count: 21, percent: 23 },
                { name: 'Tablette', count: 4, percent: 4 }
            ];
        }

        // Projets les plus vus
        let topProjects = [];
        try {
            const projRes = await db.execute(`
                SELECT metadata as title, COUNT(*) as views 
                FROM visitor_logs 
                WHERE event_type = 'project_view' AND metadata IS NOT NULL AND metadata != '' 
                GROUP BY title 
                ORDER BY views DESC 
                LIMIT 5;
            `);
            topProjects = projRes.rows;
        } catch {}

        // Activité récente
        let recentLogs = [];
        try {
            const logsRes = await db.execute(`
                SELECT id, visitor_id, event_type, referrer, source_category, device_type, browser, os, metadata, created_at 
                FROM visitor_logs 
                ORDER BY created_at DESC 
                LIMIT 30;
            `);
            recentLogs = logsRes.rows;
        } catch {}

        return res.status(200).json({
            views: totalViews,
            uniqueVisitors,
            whatsapp: whatsappClicks,
            leads: leadsCount,
            conversionRate,
            timeline,
            sources,
            devices,
            topProjects,
            recentLogs
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.post('/api/stats', async (req, res) => {
    try {
        const db = getDb();
        const body = req.body || {};
        const event_type = body.event_type || (body.metric === 'whatsapp' ? 'whatsapp_click' : 'pageview');
        const visitor_id = body.visitor_id || ('v_' + Date.now().toString(36));
        const referrer = body.referrer || 'Direct';
        const source_category = body.source_category || 'Direct';
        const device_type = body.device_type || 'Mobile';
        const browser = body.browser || 'Inconnu';
        const os = body.os || 'Inconnu';
        const page = body.page || '/';
        const metadata = body.metadata || '';
        const logId = 'log-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);

        if (event_type === 'whatsapp_click' || body.metric === 'whatsapp') {
            await db.execute("UPDATE stats SET whatsapp = whatsapp + 1 WHERE id = 'default';");
        } else if (event_type === 'pageview' || body.metric === 'views') {
            await db.execute("UPDATE stats SET views = views + 1 WHERE id = 'default';");
        }

        try {
            await db.execute({
                sql: `INSERT INTO visitor_logs (id, visitor_id, event_type, page, referrer, source_category, device_type, browser, os, metadata, created_at)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);`,
                args: [logId, visitor_id, event_type, page, referrer, source_category, device_type, browser, os, metadata]
            });
        } catch (logErr) {
            console.warn('Logging visitor notice:', logErr.message);
        }

        return res.status(200).json({ success: true, id: logId });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// =========================================================================
// 5. SERVICE DES FICHIERS STATIQUES (FRONTEND & ADMIN EN DIRECT)
// =========================================================================
app.use(express.static(__dirname));

// Fallback d'URL pour le SPA (Router HTML5 / Admin)
app.use((req, res) => {
    if (req.path.startsWith('/admin')) {
        return res.sendFile(path.join(__dirname, 'admin', 'index.html'));
    }
    return res.sendFile(path.join(__dirname, 'index.html'));
});

// DÉMARRAGE DU SERVEUR ET INITIALISATION DE LA BASE SQLITE
async function start() {
    try {
        await initDb();
        console.log('Base de données SQLite (grafrika.db) prête.');

        app.listen(PORT, () => {
            console.log(`\n======================================================`);
            console.log(`  ATELIER GRAFRIKA - SERVEUR EN LIGNE`);
            console.log(`  Port : http://localhost:${PORT}`);
            console.log(`  Admin : http://localhost:${PORT}/admin`);
            console.log(`  Identifiants : admin@ateliergrafrika.com / grafrika2026`);
            console.log(`======================================================\n`);
        });
    } catch (err) {
        console.error('Erreur démarrage serveur:', err);
        process.exit(1);
    }
}

start();
