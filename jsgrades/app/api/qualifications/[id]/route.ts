import { NextRequest, NextResponse } from 'next/server';
import { validateAuth } from '@/lib/server/auth';
import { APIResponse, Qualification } from '@/types';
import {
    getQualificationById,
    updateQualification,
} from '@/lib/server/qualifications';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authenticatedUser = await validateAuth(request);

        if (!authenticatedUser) {
            return NextResponse.json<APIResponse<null>>(
                {
                    status: 'error',
                    message: 'Unauthorized',
                    data: null,
                },
                { status: 401 }
            );
        }

        const { id: qualificationId } = await params;
        const updates = await request.json();

        console.log('PUT /api/qualifications/[id] - Debug info:');
        console.log('- Qualification ID:', qualificationId);
        console.log('- Firebase UID:', authenticatedUser.uid);
        console.log('- Updates:', updates);

        const existingQualification =
            await getQualificationById(qualificationId);
        console.log('- Existing qualification:', existingQualification);

        if (!existingQualification) {
            console.log('- Qualification not found in database');
            return NextResponse.json<APIResponse<null>>(
                {
                    status: 'error',
                    message: 'Qualification not found',
                    data: null,
                },
                { status: 404 }
            );
        }

        console.log(
            '- Proceeding with update for qualification user:',
            existingQualification.userId
        );

        const updatedQualification = await updateQualification(
            qualificationId,
            updates
        );

        return NextResponse.json<APIResponse<Qualification>>(
            {
                status: 'success',
                message: 'Qualification updated successfully',
                data: updatedQualification,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating qualification:', error);
        return NextResponse.json<APIResponse<null>>(
            {
                status: 'error',
                message: 'Failed to update qualification',
                data: null,
            },
            { status: 500 }
        );
    }
}
