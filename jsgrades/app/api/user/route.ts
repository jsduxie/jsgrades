import { NextResponse } from 'next/server';
import { getUserDetails, addUser } from '@/lib/server/user';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const user = await addUser(body);
        return NextResponse.json(user, { status: 201 });
    } catch (err) {
        return NextResponse.json(
            { message: `Error creating user: ${err}` },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');

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
        return NextResponse.json(
            { message: `Error finding user details: ${err}` },
            { status: 500 }
        );
    }
}
