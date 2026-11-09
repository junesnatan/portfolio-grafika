import { getDb, initDb } from '../_db.js';
import { verifyToken } from '../_auth.js';

export default async function handler(req, res) {
    await initDb();
    const db = getDb();

    // GET /api/leads : Liste des prospects (admin requis)
    if (req.method === 'GET') {
        try {
            verifyToken(req);
            const result = await db.execute('SELECT * FROM leads ORDER BY created_at DESC;');
            return res.status(200).json(result.rows);
        } catch (err) {
            const status = err.message.includes('Non autorisé') ? 401 : 500;
            return res.status(status).json({ error: err.message });
        }
    }

    // POST /api/leads : Nouveau devis depuis le site public (ouvert)
    if (req.method === 'POST') {
        try {
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

            // Incrémenter automatiquement le compteur de leads dans les stats
            await db.execute(`UPDATE stats SET leads = leads + 1 WHERE id = 'default';`);

            return res.status(201).json({ success: true, id, message: 'Demande enregistrée avec succès' });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    return res.status(405).json({ error: 'Méthode non autorisée' });
}
