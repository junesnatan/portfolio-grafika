import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import fs from 'fs';

// Lecture de l'URL MySQL depuis .env
let mysqlUrl = process.env.MYSQL_URL;
if (!mysqlUrl && fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf-8');
    const match = envContent.match(/MYSQL_URL=(.+)/);
    if (match) mysqlUrl = match[1].trim();
}

if (!mysqlUrl) {
    console.error('Erreur : MYSQL_URL non trouvée dans .env ni dans process.env');
    process.exit(1);
}

const args = process.argv.slice(2);
const email = args[0] || 'admin@ateliergrafrika.bj';
const password = args[1];

if (!password) {
    console.log('Usage: node scripts/manage-admin.js <email> <password>');
    console.log('Exemple: node scripts/manage-admin.js admin@ateliergrafrika.bj MonSuperMotDePasse2026!');
    process.exit(1);
}

async function run() {
    console.log(`\n--- ENREGISTREMENT ADMINISTRATEUR DANS LA BASE MYSQL ---`);
    console.log(`Cible : ${email}`);

    const pool = mysql.createPool({
        uri: mysqlUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        // 1. Chiffrement fort avec bcrypt (10 rounds de sel)
        const passwordHash = await bcrypt.hash(password, 10);

        // 2. Vérification / création de la table auth si inexistante
        await pool.query(`
            CREATE TABLE IF NOT EXISTS auth (
                id VARCHAR(64) PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 3. Insertion ou mise à jour sécurisée (Upsert)
        await pool.query(`
            INSERT INTO auth (id, email, password_hash)
            VALUES ('admin-root', ?, ?)
            ON DUPLICATE KEY UPDATE 
                email = VALUES(email),
                password_hash = VALUES(password_hash),
                updated_at = CURRENT_TIMESTAMP;
        `, [email.toLowerCase().trim(), passwordHash]);

        console.log(` Succès : L'administrateur a été enregistré dans la base de données.`);
        console.log(` Identifiant : ${email.toLowerCase().trim()}`);
        console.log(` Mot de passe : Haché et sécurisé avec bcrypt (aucun mot de passe en clair).`);
        console.log(` Le rôle d'accès est exclusif à cet enregistrement.`);
    } catch (err) {
        console.error('Erreur lors de l\'enregistrement :', err.message);
    } finally {
        await pool.end();
    }
}

run();
