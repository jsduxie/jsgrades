import { NextRequest, NextResponse } from 'next/server';
import { validateAuth } from '@/lib/server/auth';
import type { APIResponse, QualificationNodeType } from '@/types';

/* Fetches all qualification levels */
export async function GET(req: NextRequest) {
    try {
        const user = await validateAuth(req);

        if (!user) {
            return NextResponse.json<APIResponse>(
                { status: 'error', message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const pool = (await import('@/lib/server/db')).default;

        const result = await pool.query(
            'SELECT id, name, allow_children FROM node_types'
        );

        const qualificationNodeTypes: QualificationNodeType[] = result.rows.map(
            (row) => ({
                id: row.id,
                name: row.name,
                allowChildren: row.allow_children,
            })
        );

        return NextResponse.json<APIResponse<QualificationNodeType[]>>(
            {
                status: 'success',
                message: 'Qualification node types fetched successfully',
                data: qualificationNodeTypes,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('[GET /api/node-types] Error:', error);
        return NextResponse.json<APIResponse>(
            {
                status: 'error',
                message:
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch qualification node types',
            },
            { status: 500 }
        );
    }
}
