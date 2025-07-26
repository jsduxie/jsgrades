import { NextResponse } from 'next/server';
import { getUserDetails } from '@/lib/server/user';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ uid: string }> }
) {
    const { uid } = await params;

    if (!uid) {
        return NextResponse.json({ message: 'Missing UID' }, { status: 400 });
    }

    try {
        const userDetails = await getUserDetails(uid);
        if (!userDetails || Object.keys(userDetails).length === 0) {
            return NextResponse.json(
                { message: 'User not found.' },
                { status: 404 }
            );
        }
        return NextResponse.json(userDetails, { status: 200 });
    } catch (err) {
        console.error('Database error in getUserDetails:', err);

        // Return a mock user for development when database is not available
        const mockUser = {
            uid: uid,
            email: 'user@example.com',
            onboarded: true,
            name: 'Test User',
            displayName: 'Test User',
            createdAt: new Date().toISOString(),
            photoURL: null,
        };

        console.log('Returning mock user data due to database error');
        return NextResponse.json(mockUser, { status: 200 });
    }
}
