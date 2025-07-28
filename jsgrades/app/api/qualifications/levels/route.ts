'use server';

import { getQualificationLevels } from '@/lib/server/qualifications';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const levels = await getQualificationLevels();
        return NextResponse.json({ status: 'success', data: levels });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Failed to fetch qualification levels',
            },
            { status: 500 }
        );
    }
}
