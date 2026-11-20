import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV?.includes('preview')) {
            throw new Error('Configuration de sécurité requise : la variable JWT_SECRET doit être définie sur le serveur de production.');
        }
        return 'atelier-grafrika-dev-jwt-key-local-only';
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
