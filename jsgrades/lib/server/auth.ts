import { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { AuthenticatedUser } from '@/types';

if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

export async function validateAuth(
    req: NextRequest
): Promise<AuthenticatedUser | null> {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.substring(7);
        const decodedToken = await getAuth().verifyIdToken(token);

        return {
            id: decodedToken.uid,
            email: decodedToken.email || '',
            uid: decodedToken.uid,
        };
    } catch (error) {
        console.error('Auth validation error:', error);
        return null;
    }
}
