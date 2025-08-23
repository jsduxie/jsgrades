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

            const verifyRoot = await stubUtil.dbClient.query(
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

    afterAll(async () => {
        await stubUtil.cleanup();
    });

    describe('NodeServices.createNode', () => {
        it('creates node + aggregate + edge', async () => {
            const { node, aggregate } = await NodeService.createNode({
                parentId: ctx.rootNodeId,
                type: 'module', // Use type name instead of UUID
                name: 'Module A',
                qualificationId: ctx.qualificationId,
                userId: ctx.userId,
            });

            expect(node.id).toBeDefined();
            expect(aggregate.nodeId).toBe(node.id);

            const edge = await stubUtil.dbClient.query(
                `SELECT position FROM node_edges WHERE parent_id = $1 AND child_id = $2`,
                [ctx.rootNodeId, node.id]
            );
            expect(edge.rowCount).toBe(1);
        });

        it('supports explicit settings override', async () => {
            const { node, aggregate } = await NodeService.createNode({
                parentId: ctx.rootNodeId,
                type: 'module', // Use type name instead of UUID
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
            expect(node.overrides).toEqual({});

            expect(aggregate.effectiveSettings).toBeDefined();
        });

        it('should correctly assign edge position when many child nodes', async () => {
            // First check how many edges already exist for this parent
            const initialEdges = await stubUtil.dbClient.query(
                `SELECT COUNT(*) as count FROM node_edges WHERE parent_id = $1`,
                [ctx.rootNodeId]
            );
            const initialCount = parseInt(initialEdges.rows[0].count);

            // Create multiple child nodes
            const children = [];
            for (let i = 0; i < 5; i++) {
                const { node } = await NodeService.createNode({
                    parentId: ctx.rootNodeId,
                    type: 'module', // Use type name instead of UUID
                    name: `Module ${i + 1}`,
                    qualificationId: ctx.qualificationId,
                    userId: ctx.userId,
                });
                children.push(node);
            }

            // Verify positions are assigned correctly (based on initial count + new positions)
            const edges = await stubUtil.dbClient.query(
                `SELECT position FROM node_edges WHERE parent_id = $1 ORDER BY position`,
                [ctx.rootNodeId]
            );

            expect(edges.rows.length).toBe(initialCount + 5);

            // Check that the new nodes have positions starting from initialCount + 1
            const newEdgePositions = edges.rows.slice(-5); // Get the last 5 positions
            for (let i = 0; i < 5; i++) {
                expect(newEdgePositions[i].position).toBe(initialCount + i + 1);
            }
        });
    });
});
