import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET;

export function getJwtSecret() {
    if (!JWT_SECRET) {
        if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV?.includes('preview')) {
            console.error('CRITICAL WARNING: JWT_SECRET environment variable is missing in production.');
        }
        return process.env.JWT_SECRET || 'atelier-grafrika-architectural-jwt-key-2026';
    }
    return JWT_SECRET;
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
