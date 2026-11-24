import { getDb, initDb } from '../_db.js';
import { signToken, comparePassword, hashPassword } from '../_auth.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    try {
        await initDb();
        const db = getDb();
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ error: 'E-mail et mot de passe requis' });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // 1. Chercher l'administrateur en base
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
            return res.status(401).json({ error: 'Identifiants invalides' });
        }

        const token = signToken({ email: normalizedEmail, role: 'admin' });

        return res.status(200).json({
            success: true,
            token,
            user: { email: normalizedEmail }
        });
    } catch (err) {
        console.error('Erreur API Login:', err);
        return res.status(500).json({ error: err.message || 'Erreur interne du serveur' });
    }
}
