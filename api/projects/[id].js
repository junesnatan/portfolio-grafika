import { getDb, initDb } from '../_db.js';
import { verifyToken } from '../_auth.js';

export default async function handler(req, res) {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: 'Identifiant de projet manquant' });
    }

    await initDb();
    const db = getDb();

    // PUT /api/projects/:id : Mise à jour du projet (admin requis)
    if (req.method === 'PUT') {
        try {
            verifyToken(req);
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
            const status = err.message.includes('Non autorisé') ? 401 : 500;
            return res.status(status).json({ error: err.message });
        }
    }

    // DELETE /api/projects/:id : Suppression du projet (admin requis)
    if (req.method === 'DELETE') {
        try {
            verifyToken(req);
            await db.execute({
                sql: 'DELETE FROM projects WHERE id = ?;',
                args: [id]
            });
            return res.status(200).json({ success: true, message: 'Projet supprimé' });
        } catch (err) {
            const status = err.message.includes('Non autorisé') ? 401 : 500;
            return res.status(status).json({ error: err.message });
        }
    }

    return res.status(405).json({ error: 'Méthode non autorisée' });
}
