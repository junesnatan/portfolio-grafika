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
            const isDefaultEmail = normalizedEmail === 'admin@ateliergrafrika.com' || normalizedEmail === 'admin@ateliergrafika.com';
            const isDefaultPass = password === 'grafrika2026' || password === 'grafika2026';

            if (isDefaultEmail && isDefaultPass) {
                isValid = true;
                const hashed = await hashPassword('grafrika2026');
                await db.execute({
                    sql: 'INSERT INTO auth (id, email, password_hash) VALUES (?, ?, ?);',
                    args: ['admin-root', 'admin@ateliergrafrika.com', hashed]
                });
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
        return res.status(200).json(projects);
    } catch (err) {
        return res.status(500).json({ error: err.message });
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
        const { name, phone, domain, city, message } = req.body || {};

        if (!name || !phone) {
            return res.status(400).json({ error: 'Nom et téléphone requis' });
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
            sql: `INSERT INTO leads (id, name, phone, domain, city, message, status, date)
                  VALUES (?, ?, ?, ?, ?, ?, 'Nouveau', ?);`,
            args: [
                id,
                name.trim(),
                phone.trim(),
                domain ? domain.trim() : 'Projet Architectural',
                city ? city.trim() : 'Bénin',
                message ? message.trim() : '',
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
        const result = await db.execute("SELECT views, whatsapp, leads FROM stats WHERE id = 'default' LIMIT 1;");
        if (result.rows.length > 0) {
            return res.status(200).json(result.rows[0]);
        }
        return res.status(200).json({ views: 248, whatsapp: 39, leads: 12 });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.post('/api/stats', async (req, res) => {
    try {
        const db = getDb();
        const { metric } = req.body || {};
        if (metric === 'whatsapp') {
            await db.execute("UPDATE stats SET whatsapp = whatsapp + 1 WHERE id = 'default';");
        } else if (metric === 'views') {
            await db.execute("UPDATE stats SET views = views + 1 WHERE id = 'default';");
        }
        return res.status(200).json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// =========================================================================
// 5. SERVICE DES FICHIERS STATIQUES (FRONTEND & ADMIN)
// =========================================================================
const distDir = path.join(__dirname, 'dist');
const hasDist = fs.existsSync(distDir);

if (hasDist) {
    app.use(express.static(distDir));
} else {
    app.use(express.static(__dirname));
}

// Fallback d'URL pour le SPA (Router HTML5 / Admin)
app.use((req, res) => {
    if (req.path.startsWith('/admin')) {
        const adminIndex = hasDist
            ? path.join(distDir, 'admin', 'index.html')
            : path.join(__dirname, 'admin', 'index.html');
        return res.sendFile(adminIndex);
    }
    const mainIndex = hasDist
        ? path.join(distDir, 'index.html')
        : path.join(__dirname, 'index.html');
    return res.sendFile(mainIndex);
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
