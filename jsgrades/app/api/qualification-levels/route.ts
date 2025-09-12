import { NextRequest, NextResponse } from 'next/server';
import { validateAuth } from '@/lib/server/auth';
import type { APIResponse, QualificationLevel } from '@/types';

/* Fetches all qualification levels */
export async function GET(req: NextRequest) {
    try {
        console.log('[GET /api/qualification-levels] Incoming request');
        const user = await validateAuth(req);

        if (!user) {
            return NextResponse.json<APIResponse>(
                { status: 'error', message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const pool = (await import('@/lib/server/db')).default;

        const result = await pool.query(
            'SELECT id, name, level FROM qualification_levels ORDER BY level ASC'
        );

        const qualificationLevels: QualificationLevel[] = result.rows.map(
            (row) => ({
                id: row.id,
                name: row.name,
                level: row.level,
                description: row.description,
            })
        );

        return NextResponse.json<APIResponse<QualificationLevel[]>>(
            {
                status: 'success',
                message: 'Qualification levels fetched successfully',
                data: qualificationLevels,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('[GET /api/qualification-levels] Error:', error);
        return NextResponse.json<APIResponse>(
            {
                status: 'error',
                message:
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch qualification levels',
            },
            { status: 500 }
        );
    }
}
