import { NextRequest } from 'next/server';
import admin from './firebase-admin';

export interface AuthenticatedUser {
    uid: string;
    email?: string;
    name?: string;
}

export const verifyToken = async (
    request: NextRequest
): Promise<AuthenticatedUser> => {
    const authorization = request.headers.get('authorization');

    if (!authorization?.startsWith('Bearer ')) {
        throw new Error('No token provided');
    }

    const token = authorization.split(' ')[1];

    try {
        const decoded = await admin.auth().verifyIdToken(token);
        return {
            uid: decoded.uid,
            email: decoded.email,
            name: decoded.name || decoded.display_name,
        };
    } catch (error) {
        throw new Error(`Invalid Token: ${error}`);
    }
};

export const withAuth = async (
    request: NextRequest,
    handler: (user: AuthenticatedUser) => Promise<Response>
) => {
    try {
        const user = await verifyToken(request);
        return await handler(user);
    } catch (error) {
        return new Response(
            JSON.stringify({
                error:
                    error instanceof Error
                        ? error.message
                        : 'Authentication failed',
            }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
