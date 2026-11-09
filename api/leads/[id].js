import { getDb, initDb } from '../_db.js';
import { verifyToken } from '../_auth.js';

export default async function handler(req, res) {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: 'Identifiant du prospect manquant' });
    }

    await initDb();
    const db = getDb();

    // PATCH /api/leads/:id : Mise à jour du statut (admin requis)
    if (req.method === 'PATCH') {
        try {
            verifyToken(req);
            const { status } = req.body || {};

            if (!status) {
                return res.status(400).json({ error: 'Nouveau statut requis' });
            }

            await db.execute({
                sql: 'UPDATE leads SET status = ? WHERE id = ?;',
                args: [status, id]
            });

            return res.status(200).json({ success: true, message: 'Statut mis à jour' });
        } catch (err) {
            const statusCode = err.message.includes('Non autorisé') ? 401 : 500;
            return res.status(statusCode).json({ error: err.message });
        }
    }

    // DELETE /api/leads/:id : Suppression du prospect (admin requis)
    if (req.method === 'DELETE') {
        try {
            verifyToken(req);
            await db.execute({
                sql: 'DELETE FROM leads WHERE id = ?;',
                args: [id]
            });
            return res.status(200).json({ success: true, message: 'Prospect supprimé' });
        } catch (err) {
            const statusCode = err.message.includes('Non autorisé') ? 401 : 500;
            return res.status(statusCode).json({ error: err.message });
        }
    }

    return res.status(405).json({ error: 'Méthode non autorisée' });
}
