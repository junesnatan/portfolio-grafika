import { getDb, initDb } from '../_db.js';
import { verifyToken } from '../_auth.js';
import { DEFAULT_SETTINGS } from '../../data/initial-data.js';

export default async function handler(req, res) {
    await initDb();
    const db = getDb();

    // GET /api/settings : Coordonnées publiques de l'agence
    if (req.method === 'GET') {
        try {
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
    }

    // PUT /api/settings : Mise à jour par l'administrateur
    if (req.method === 'PUT') {
        try {
            verifyToken(req);
            const settingsData = req.body || {};

            await db.execute({
                sql: `INSERT INTO settings (id, data, updated_at)
                      VALUES ('default', ?, CURRENT_TIMESTAMP)
                      ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP;`,
                args: [JSON.stringify(settingsData)]
            });

            return res.status(200).json({ success: true, message: 'Réglages enregistrés' });
        } catch (err) {
            const status = err.message.includes('Non autorisé') ? 401 : 500;
            return res.status(status).json({ error: err.message });
        }
    }

    return res.status(405).json({ error: 'Méthode non autorisée' });
}
