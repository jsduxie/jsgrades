import { NextResponse } from 'next/server';
import { getUser } from '@/lib/server/user';
import { APIResponse, ClientUserDetails } from '@/types';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ uid: string }> }
) {
    const { uid } = await params;

    if (!uid) {
        return NextResponse.json<APIResponse>(
            { status: 'error', message: 'Missing UID' },
            { status: 400 }
        );
    }

    try {
        const userDetails = await getUser(uid);

        if (!userDetails || Object.keys(userDetails).length === 0) {
            return NextResponse.json<APIResponse>(
                { status: 'error', message: 'User not found' },
                { status: 404 }
            );
        }

        console.log(userDetails);

        return NextResponse.json<APIResponse<Partial<ClientUserDetails>>>(
            { status: 'success', message: 'User found', data: userDetails },
            { status: 200 }
        );
    } catch (err) {
        console.error('Database error in getUserDetails:', err);
        return NextResponse.json(
            { status: 'error', message: 'Database error' },
            { status: 500 }
        );
    }
}
