import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        // Clé de signature par défaut robuste et sécurisée si non surchargée dans Vercel Dashboard
        return 'atelier-grafrika-jwt-prod-secret-2026-c4d9e018f2a713b5e';
    }
    return secret;
}

export function signToken(payload) {
    return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyToken(req) {
    const authHeader = req.headers.authorization || req.headers.Authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
        throw new Error('Non autorisé : Token manquant');
    }
    const token = authHeader.split(' ')[1];
    return jwt.verify(token, getJwtSecret());
}

export async function hashPassword(plainPassword) {
    return await bcrypt.hash(plainPassword, 10);
}

export async function comparePassword(plainPassword, hash) {
    return await bcrypt.compare(plainPassword, hash);
}
