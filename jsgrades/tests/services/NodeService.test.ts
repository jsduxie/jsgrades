import '@jest/globals';
import { NodeService } from '@/lib/server/NodeService';
import { StubUtility, TestContext } from '@/tests/StubUtility';

let stubUtil: StubUtility;
let ctx: TestContext;

jest.setTimeout(30000);

describe('NodeService', () => {
    beforeAll(async () => {
        stubUtil = await StubUtility.create();

        try {
            ctx = await stubUtil.getTestContext();
            console.log(
                `Test context initialized with root node: ${ctx.rootNodeId}`
            );

            const verifyRoot = await stubUtil.client.query(
                `SELECT id FROM qualification_nodes WHERE id = $1`,
                [ctx.rootNodeId]
            );
            if (verifyRoot.rows.length === 0) {
                throw new Error(
                    `Root node ${ctx.rootNodeId} not found after initialization`
                );
            } else {
                console.log(`Root node ${ctx.rootNodeId} verified to exist`);
            }
        } catch (error) {
            console.error('Failed to initialize test context:', error);
            throw error;
        }
    });

    afterEach(async () => {
        try {
            await stubUtil.client.query('ROLLBACK');
        } catch (e) {
            console.error('Error rolling back transaction:', e);
        }
    });

    describe('NodeServices.createNode', () => {
        it('creates node + aggregate + edge', async () => {
            const { node, aggregate } = await NodeService.createNode({
                parentId: ctx.rootNodeId,
                type: ctx.nodeTypeModuleId,
                name: 'Module A',
                qualificationId: ctx.qualificationId,
                userId: ctx.userId,
            });

            expect(node.id).toBeDefined();
            expect(aggregate.nodeId).toBe(node.id);

            const edge = await stubUtil.client.query(
                `SELECT position FROM node_edges WHERE parent_id = $1 AND child_id = $2`,
                [ctx.rootNodeId, node.id]
            );
            expect(edge.rowCount).toBe(1);
        });

        it('supports explicit settings override', async () => {
            const { node, aggregate } = await NodeService.createNode({
                parentId: ctx.rootNodeId,
                type: ctx.nodeTypeModuleId,
                name: 'Advanced Computer Vision',
                settings: {
                    calculationMethod: 'sum',
                    roundingPrecision: 7,
                },
                qualificationId: ctx.qualificationId,
                userId: ctx.userId,
            });

            expect(node.id).toBeDefined();
            expect(aggregate.nodeId).toBe(node.id);

            expect(node.calculationMethod).toBe('sum');
            expect(node.roundingPrecision).toBe(7);

            expect(node.weightingMode).toBe('equal');
            expect(node.roundingMode).toBe('none');
            expect(node.excludeIncompleteFromPredicted).toBe(true);
            expect(node.inheritSettings).toBe(true);
        });

        it('should correctly assign edge position when many child nodes', async () => {
            const initialPositionQuery = await stubUtil.client.query(
                `SELECT COALESCE(MAX(position), 0) as max_position
                 FROM node_edges
                 WHERE parent_id = $1`,
                [ctx.rootNodeId]
            );
            const initialPosition =
                parseInt(initialPositionQuery.rows[0].max_position) || 0;
            console.log(`Starting with initial position: ${initialPosition}`);

            const nodesToCreate = 5;
            for (let i = 1; i <= nodesToCreate; i++) {
                await NodeService.createNode({
                    parentId: ctx.rootNodeId,
                    type: ctx.nodeTypeModuleId,
                    name: `Module ${i}`,
                    qualificationId: ctx.qualificationId,
                    userId: ctx.userId,
                });
            }

            const start = process.hrtime.bigint();
            const { node: newNode } = await NodeService.createNode({
                parentId: ctx.rootNodeId,
                type: ctx.nodeTypeModuleId,
                name: `Module ${nodesToCreate + 1}`,
                qualificationId: ctx.qualificationId,
                userId: ctx.userId,
            });
            const end = process.hrtime.bigint();
            const durationMs = Number(end - start) / 1_000_000;

            const edgeRes = await stubUtil.client.query(
                `SELECT position FROM node_edges WHERE parent_id = $1 AND child_id = $2`,
                [ctx.rootNodeId, newNode.id]
            );
            expect(edgeRes.rowCount).toBe(1);

            const expectedPosition = initialPosition + nodesToCreate + 1;
            console.log(
                `Expecting position: ${expectedPosition}, got: ${edgeRes.rows[0].position}`
            );
            expect(edgeRes.rows[0].position).toBe(expectedPosition);

            console.log(
                `createNode (${nodesToCreate + 1}th child) duration: ${durationMs.toFixed(2)}ms`
            );
        });
    });
});
