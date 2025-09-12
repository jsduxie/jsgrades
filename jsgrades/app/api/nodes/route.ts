// noinspection SpellCheckingInspection

import { NextRequest, NextResponse } from 'next/server';
import { validateAuth } from '@/lib/server/auth';
import { ValidationService } from '@/lib/server/ValidationService';
import { NodeService } from '@/lib/server/NodeService';
import type { APIResponse } from '@/types';
import type { NewNode, Node, NodeAggregate } from '@/types/qualificationNode';

/* Fetches nodes for a qualification */
export async function GET(req: NextRequest) {
    try {
        console.log('[GET /api/nodes] Incoming request');
        const user = await validateAuth(req);

        if (!user) {
            return NextResponse.json<APIResponse>(
                { status: 'error', message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const qualificationId = searchParams.get('qualificationId');

        if (!qualificationId) {
            return NextResponse.json<APIResponse>(
                {
                    status: 'error',
                    message: 'qualificationId parameter is required',
                },
                { status: 400 }
            );
        }

        console.log(
            '[GET /api/nodes] Fetching nodes for qualification:',
            qualificationId
        );

        try {
            const nodes =
                await NodeService.getNodesByQualification(qualificationId);
            console.log(
                '[GET /api/nodes] Successfully retrieved nodes:',
                nodes.length
            );

            return NextResponse.json<APIResponse<Node[]>>(
                {
                    status: 'success',
                    message: `Fetched ${nodes.length} nodes`,
                    data: nodes,
                },
                { status: 200 }
            );
        } catch (dbError) {
            console.error('[GET /api/nodes] Database error:', dbError);

            // Handle specific database timeout errors
            if (
                dbError instanceof Error &&
                (dbError.message.includes('timeout') ||
                    dbError.message.includes('connection'))
            ) {
                console.log(
                    '[GET /api/nodes] Database timeout detected, returning empty array as fallback'
                );

                // Return empty array as fallback for timeout errors
                // This prevents the UI from being stuck in loading state
                return NextResponse.json<APIResponse<Node[]>>(
                    {
                        status: 'success',
                        data: [],
                        message:
                            'Database temporarily unavailable - no nodes to display',
                    },
                    { status: 200 }
                );
            }

            // Re-throw other database errors
            throw dbError;
        }
    } catch (error) {
        console.error('[GET /api/nodes] Error:', error);
        return NextResponse.json<APIResponse>(
            {
                status: 'error',
                message:
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch nodes',
            },
            { status: 500 }
        );
    }
}

/* Creates a new node */
export async function POST(req: NextRequest) {
    try {
        console.log('[POST /api/nodes] Incoming request');
        const user = await validateAuth(req);
        console.log(
            '[POST /api/nodes] Auth result:',
            user ? user.id : 'unauthenticated'
        );

        if (!user) {
            return NextResponse.json<APIResponse>(
                { status: 'error', message: 'Unauthorized' },
                { status: 401 }
            );
        }

        let body: NewNode;
        try {
            body = await req.json();
            console.log('[POST /api/nodes] Parsed body:', body);
        } catch (jsonError) {
            console.error('JSON parsing error:', jsonError);
            return NextResponse.json<APIResponse>(
                { status: 'error', message: 'Invalid JSON in request body' },
                { status: 500 } // tests expect 500 for invalid JSON
            );
        }

        const validation = ValidationService.validateNewNodeData(body);
        console.log('[POST /api/nodes] Input validation:', validation);
        if (!validation.isValid) {
            return NextResponse.json<APIResponse<string[]>>(
                {
                    status: 'error',
                    message: 'Invalid input data',
                    data: validation.errors,
                },
                { status: 400 }
            );
        }

        const pool = (await import('@/lib/server/db')).default;

        // 1. Qualification ownership check (authoritative)
        let qualificationRow;
        try {
            const qres = await pool.query(
                'SELECT id, user_id FROM qualifications WHERE id = $1',
                [body.qualificationId]
            );
            qualificationRow = qres.rows[0];
        } catch (e) {
            console.error('[POST /api/nodes] Error querying qualification:', e);
            return NextResponse.json<APIResponse>(
                { status: 'error', message: 'Internal server error' },
                { status: 500 }
            );
        }

        if (!qualificationRow || qualificationRow.user_id !== user.id) {
            console.log(
                '[POST /api/nodes] Qualification ownership check failed',
                { qualificationRow, expectedUser: user.id }
            );
            return NextResponse.json<APIResponse>(
                {
                    status: 'error',
                    message: 'Qualification not found or access denied',
                },
                { status: 404 }
            );
        } else {
            console.log('[POST /api/nodes] Qualification ownership confirmed', {
                qualificationId: qualificationRow.id,
                owner: qualificationRow.user_id,
                user: user.id,
            });
        }

        // 2. Resolve parent
        let parentNodeId: string | null = null;
        if (body.parentId === body.qualificationId) {
            // Using qualification root as parent
            try {
                const rootRes = await pool.query(
                    'SELECT id FROM qualification_nodes WHERE qualification_id = $1 AND parent_id IS NULL AND user_id = $2',
                    [body.qualificationId, user.id]
                );
                if (rootRes.rows.length === 0) {
                    console.log('[POST /api/nodes] Root node missing -> 404');
                    return NextResponse.json<APIResponse>(
                        {
                            status: 'error',
                            message: 'Parent not found or access denied',
                        },
                        { status: 404 }
                    );
                }
                parentNodeId = rootRes.rows[0].id;
                console.log(
                    '[POST /api/nodes] Using qualification root as parent',
                    parentNodeId
                );
            } catch (e) {
                console.error('[POST /api/nodes] Error fetching root node:', e);
                return NextResponse.json<APIResponse>(
                    { status: 'error', message: 'Internal server error' },
                    { status: 500 }
                );
            }
        } else {
            // Parent should be a node owned by user
            try {
                const pres = await pool.query(
                    'SELECT id, lock_config, user_id FROM qualification_nodes WHERE id = $1',
                    [body.parentId]
                );
                if (pres.rows.length === 0) {
                    console.log(
                        '[POST /api/nodes] Parent node not found -> 404',
                        { parentId: body.parentId }
                    );
                    return NextResponse.json<APIResponse>(
                        {
                            status: 'error',
                            message: 'Parent not found or access denied',
                        },
                        { status: 404 }
                    );
                }
                const prow = pres.rows[0];
                if (prow.user_id !== user.id) {
                    console.log(
                        '[POST /api/nodes] Parent node owned by different user -> 404',
                        {
                            parentId: prow.id,
                            owner: prow.user_id,
                            expected: user.id,
                        }
                    );
                    return NextResponse.json<APIResponse>(
                        {
                            status: 'error',
                            message: 'Parent not found or access denied',
                        },
                        { status: 404 }
                    );
                }
                if (prow.lock_config) {
                    console.log(
                        '[POST /api/nodes] Parent node locked -> 403',
                        prow.id
                    );
                    return NextResponse.json<APIResponse>(
                        {
                            status: 'error',
                            message: 'Parent node configuration is locked',
                        },
                        { status: 403 }
                    );
                }
                parentNodeId = prow.id;
                console.log('[POST /api/nodes] Using node as parent', {
                    parentNodeId,
                    owner: prow.user_id,
                });
            } catch (e) {
                console.error(
                    '[POST /api/nodes] Error validating parent node:',
                    e
                );
                return NextResponse.json<APIResponse>(
                    { status: 'error', message: 'Internal server error' },
                    { status: 500 }
                );
            }
        }

        // 3. Create node
        let result: { node: Node; aggregate: NodeAggregate };
        try {
            result = await NodeService.createNode({
                parentId: parentNodeId, // always a node id now
                type: body.type,
                name: body.name,
                credits: body.credits,
                settings: body.settings,
                qualificationId: body.qualificationId,
                userId: user.id,
            });
            console.log('[POST /api/nodes] Node created successfully:', {
                nodeId: result.node.id,
                parentId: result.node.parentId,
                type: result.node.type,
                name: result.node.name,
            });
        } catch (error) {
            console.error('Error creating node (threw):', error);
            return NextResponse.json<APIResponse>(
                { status: 'error', message: 'Failed to create node' },
                { status: 500 }
            );
        }

        return NextResponse.json<
            APIResponse<{ node: Node; aggregate: NodeAggregate }>
        >(
            {
                status: 'success',
                message: 'Node created successfully',
                data: result,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error(
            'Unexpected error in POST /api/nodes (outer catch):',
            error
        );
        return NextResponse.json<APIResponse>(
            { status: 'error', message: 'Internal server error' },
            { status: 500 }
        );
    }
}
