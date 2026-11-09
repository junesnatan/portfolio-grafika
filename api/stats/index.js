import { getDb, initDb } from '../_db.js';

export default async function handler(req, res) {
    await initDb();
    const db = getDb();

    // GET /api/stats
    if (req.method === 'GET') {
        try {
            const result = await db.execute("SELECT views, whatsapp, leads FROM stats WHERE id = 'default' LIMIT 1;");
            if (result.rows.length > 0) {
                return res.status(200).json(result.rows[0]);
            }
            return res.status(200).json({ views: 248, whatsapp: 39, leads: 12 });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    // POST /api/stats : Incrémenter une métrique (views, whatsapp)
    if (req.method === 'POST') {
        try {
            const { metric } = req.body || {};
            if (metric === 'whatsapp') {
                await db.execute(`UPDATE stats SET whatsapp = whatsapp + 1 WHERE id = 'default';`);
            } else if (metric === 'views') {
                await db.execute(`UPDATE stats SET views = views + 1 WHERE id = 'default';`);
            }
            return res.status(200).json({ success: true });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    return res.status(405).json({ error: 'Méthode non autorisée' });
}
