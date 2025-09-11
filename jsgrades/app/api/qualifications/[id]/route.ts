import { APIResponse, Qualification } from '@/types';
import { NextRequest, NextResponse } from 'next/server';
import { validateAuth } from '@/lib/server/auth';
import { updateQualification } from '@/lib/server/qualifications';

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await validateAuth(req);
        if (!user) {
            return NextResponse.json<APIResponse>(
                { status: 'error', message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = params;
        if (!id) {
            return NextResponse.json<APIResponse>(
                { status: 'error', message: 'Missing qualification id' },
                { status: 400 }
            );
        }

        const body = await req.json();
        const {
            name,
            institution,
            userId,
            level,
            startDate,
            endDate,
            currentGrade,
            targetGrade,
            predictedGrade,
            inProgress,
        } = body || {};

        if (userId && userId !== user.id) {
            return NextResponse.json<APIResponse>(
                { status: 'error', message: 'Forbidden' },
                { status: 403 }
            );
        }

        const updates: Record<string, unknown> = {};
        if (userId) updates.userId = userId;
        else updates.userId = user.id;
        if (level !== undefined) updates.level = level;
        if (name !== undefined) updates.name = name;
        if (institution !== undefined) updates.institution = institution;
        if (currentGrade !== undefined) updates.currentGrade = currentGrade;
        if (targetGrade !== undefined) updates.targetGrade = targetGrade;
        if (predictedGrade !== undefined)
            updates.predictedGrade = predictedGrade;
        if (inProgress !== undefined) updates.inProgress = inProgress;

        if (startDate !== undefined) {
            updates.startDate = startDate ? new Date(startDate) : null;
        }

        if (endDate !== undefined || inProgress !== undefined) {
            if (inProgress === true) {
                updates.endDate = null;
            } else if (endDate !== undefined) {
                updates.endDate = endDate ? new Date(endDate) : null;
            }
        }

        try {
            const saved = await updateQualification(id, updates);
            return NextResponse.json<APIResponse<Qualification>>(
                {
                    status: 'success',
                    message: 'Qualification updated',
                    data: saved,
                },
                { status: 200 }
            );
        } catch (err: unknown) {
            if (err instanceof Error) {
                if (err.message === 'No valid fields to update') {
                    return NextResponse.json<APIResponse>(
                        {
                            status: 'error',
                            message: 'No fields provided for update',
                        },
                        { status: 400 }
                    );
                }
                if (err.message.includes('not found')) {
                    return NextResponse.json<APIResponse>(
                        { status: 'error', message: 'Qualification not found' },
                        { status: 404 }
                    );
                }
                console.error('Unexpected error updating qualification', err);
            } else {
                console.error(
                    'Unexpected non-Error value thrown while updating qualification',
                    err
                );
            }
            return NextResponse.json<APIResponse>(
                { status: 'error', message: 'Failed to update qualification' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json<APIResponse>(
            { status: 'error', message: 'Failed to update qualification' },
            { status: 500 }
        );
    }
}
