import {
    addQualification,
    getQualifications,
} from '@/lib/server/qualifications';
import { NextResponse } from 'next/server';
import { APIResponse, Qualification } from '@/types';

export async function POST(req: Request) {
    try {
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
        } = body;

        if (!name || !institution || !userId || !level) {
            return NextResponse.json<APIResponse>(
                { status: 'error', message: 'Missing required fields' },
                { status: 400 }
            );
        }

        const saved = await addQualification({
            userId,
            level,
            name,
            institution,
            startDate: startDate ? new Date(startDate) : null,
            endDate: inProgress ? null : endDate ? new Date(endDate) : null,
            currentGrade,
            targetGrade,
            predictedGrade,
            inProgress: inProgress ?? true,
        });

        return NextResponse.json<APIResponse<Qualification>>(
            { status: 'success', message: 'Qualification saved', data: saved },
            { status: 201 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json<APIResponse>(
            { status: 'error', message: 'Failed to create qualification' },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const userId = url.searchParams.get('userId');
        if (!userId) {
            return NextResponse.json<APIResponse>(
                { status: 'error', message: 'Missing userId' },
                { status: 400 }
            );
        }

        const data: Qualification[] = await getQualifications(userId);

        return NextResponse.json<APIResponse<Qualification[]>>(
            { status: 'success', message: 'Qualifications fetched', data },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json<APIResponse>(
            { status: 'error', message: 'Failed to fetch qualifications' },
            { status: 500 }
        );
    }
}
