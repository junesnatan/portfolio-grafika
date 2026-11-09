import { getDb, initDb } from '../_db.js';
import { verifyToken } from '../_auth.js';

export default async function handler(req, res) {
    await initDb();
    const db = getDb();

    // GET /api/projects : Récupérer tous les projets (public)
    if (req.method === 'GET') {
        try {
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
    }

    // POST /api/projects : Créer un nouveau projet (admin requis)
    if (req.method === 'POST') {
        try {
            verifyToken(req);
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
            const status = err.message.includes('Non autorisé') ? 401 : 500;
            return res.status(status).json({ error: err.message });
        }
    }

    return res.status(405).json({ error: 'Méthode non autorisée' });
}
