import { getDb, initDb } from '../_db.js';
import { verifyToken, hashPassword } from '../_auth.js';

export default async function handler(req, res) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    try {
        verifyToken(req);
        await initDb();
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
        return res.status(err.message.includes('Non autorisé') ? 401 : 500).json({ error: err.message });
    }
}
