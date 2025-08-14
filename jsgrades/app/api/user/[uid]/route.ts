import { NextResponse } from 'next/server';
import { getUser, addUser, updateUser } from '@/lib/server/user';
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

        return NextResponse.json<APIResponse<Partial<ClientUserDetails>>>(
            { status: 'success', message: 'User found', data: userDetails },
            { status: 200 }
        );
    } catch (err) {
        console.error('Database error in getUserDetails:', err);
        return NextResponse.json<APIResponse>(
            { status: 'error', message: 'Database error' },
            { status: 500 }
        );
    }
}

export async function POST(
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
        const body = await req.json();

        // Validate required fields
        const { email } = body;

        if (!email) {
            return NextResponse.json<APIResponse>(
                {
                    status: 'error',
                    message: 'Missing required field: email',
                },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await getUser(uid);

        if (existingUser && Object.keys(existingUser).length > 0) {
            // User exists, update the user
            const updateData: any = {};

            if (body.firstName) updateData.first_name = body.firstName;
            if (body.lastName) updateData.last_name = body.lastName;
            if (body.dateOfBirth) updateData.date_of_birth = body.dateOfBirth;
            if (body.highestQualLevel !== undefined)
                updateData.highest_qual_level = body.highestQualLevel;
            if (body.verified !== undefined)
                updateData.verified = body.verified;
            if (body.onBoarded !== undefined)
                updateData.onBoarded = body.onBoarded;
            if (body.countSignIn !== undefined)
                updateData.count_sign_in = body.countSignIn;

            const updatedUser = await updateUser(uid, updateData);

            return NextResponse.json<APIResponse<any>>(
                {
                    status: 'success',
                    message: 'User updated successfully',
                    data: updatedUser,
                },
                { status: 200 }
            );
        } else {
            // User doesn't exist, create new user
            const newUser = await addUser({
                uid,
                email,
                first_name: body.firstName,
                last_name: body.lastName,
                date_of_birth: body.dateOfBirth,
                highest_qual_level: body.highestQualLevel || null,
                verified: body.verified || false,
                onBoarded: body.onBoarded || false,
                count_sign_in: body.countSignIn || 1,
            });

            return NextResponse.json<APIResponse<any>>(
                {
                    status: 'success',
                    message: 'User created successfully',
                    data: newUser,
                },
                { status: 201 }
            );
        }
    } catch (err) {
        console.error('Database error in POST user:', err);
        return NextResponse.json<APIResponse>(
            {
                status: 'error',
                message: 'Database error: ' + (err as Error).message,
            },
            { status: 500 }
        );
    }
}
