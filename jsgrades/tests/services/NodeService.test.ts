import '@jest/globals';
import { NodeService } from '@/lib/server/NodeService';
import pool from '@/lib/server/db';
import type { PoolClient } from 'pg';

interface SeedContext {
    userId: string;
    qualificationLevelId: string;
    qualificationId: string;
    nodeTypeYearId: string;
    nodeTypeModuleId: string;
    nodeTypeAssessmentId: string;
    rootNodeId: string;
}

let client: PoolClient;
let ctx: SeedContext;

async function seedBase(c: PoolClient): Promise<SeedContext> {
    const user = await c.query(
        `INSERT INTO users (uid, email, first_name) VALUES ($1,$2,$3) RETURNING id`,
        [`test-${Date.now()}`, `t${Date.now()}@ex.com`, 'Test']
    );
    const userId = user.rows[0].id;

    const lvl = await c.query(
        `INSERT INTO qualification_levels (name, level) VALUES ($1,$2) RETURNING id`,
        [`Bachelors-${Date.now()}`, 6]
    );
    const qualificationLevelId = lvl.rows[0].id;

    const ntYear = await c.query(
        `INSERT INTO node_types (name, allow_children) VALUES ('year', true) RETURNING id`
    );
    const ntModule = await c.query(
        `INSERT INTO node_types (name, allow_children) VALUES ('module', true) RETURNING id`
    );
    const ntAssessment = await c.query(
        `INSERT INTO node_types (name, allow_children) VALUES ('assessment', false) RETURNING id`
    );

    const qual = await c.query(
        `INSERT INTO qualifications (user_id, level, name, institution) VALUES ($1,$2,$3,$4) RETURNING id`,
        [userId, qualificationLevelId, 'Test Degree', 'Test Uni']
    );
    const qualificationId = qual.rows[0].id;

    const root = await c.query(
        `INSERT INTO qualification_nodes (
       qualification_id,user_id,parent_id,name,type,
       calculation_method,weighting_mode,rounding_mode,rounding_precision,
       exclude_incomplete_from_predicted,inherit_settings,overrides,
       credit_enforcement,config_status,lock_config
     ) VALUES ($1,$2,NULL,$3,$4,'weighted_mean','equal','none',2,TRUE,TRUE,'{}','warn','partial',FALSE)
     RETURNING id`,
        [qualificationId, userId, 'Year 1', ntYear.rows[0].id]
    );
    const rootNodeId = root.rows[0].id;

    await c.query(
        `INSERT INTO node_aggregates (node_id, child_counts, effective_settings) VALUES ($1,'{}','{}')`,
        [rootNodeId]
    );

    return {
        userId,
        qualificationLevelId,
        qualificationId,
        nodeTypeYearId: ntYear.rows[0].id,
        nodeTypeModuleId: ntModule.rows[0].id,
        nodeTypeAssessmentId: ntAssessment.rows[0].id,
        rootNodeId,
    };
}

async function truncateAllTables(client: PoolClient) {
    await client.query(
        'TRUNCATE node_aggregates, node_edges, qualification_nodes, qualifications, node_types, qualification_levels, users RESTART IDENTITY CASCADE;'
    );
}

describe('NodeService', () => {
    beforeAll(async () => {
        client = await pool.connect();
    });

    afterAll(async () => {
        await client.release();
        await pool.end();
    });

    beforeEach(async () => {
        await truncateAllTables(client);
        ctx = await seedBase(client);
    });

    describe('NodeServices.createNode', () => {
        it('creates node + aggregate + edge', async () => {
            const { node, aggregate } = await NodeService.createNode({
                parentId: ctx.rootNodeId,
                type: ctx.nodeTypeModuleId,
                name: 'Module A',
                qualificationId: ctx.qualificationId,
                userId: ctx.userId,
                client,
            });

            expect(node.id).toBeDefined();
            expect(aggregate.nodeId).toBe(node.id);

            const edge = await client.query(
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
                client,
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
            let lastNodeId: string | undefined;
            for (let i = 1; i <= 50; i++) {
                const { node } = await NodeService.createNode({
                    parentId: ctx.rootNodeId,
                    type: ctx.nodeTypeModuleId,
                    name: `Module ${i}`,
                    qualificationId: ctx.qualificationId,
                    userId: ctx.userId,
                    client,
                });
                lastNodeId = node.id;
            }

            const start = process.hrtime.bigint();
            const { node: newNode } = await NodeService.createNode({
                parentId: ctx.rootNodeId,
                type: ctx.nodeTypeModuleId,
                name: 'Module 51',
                qualificationId: ctx.qualificationId,
                userId: ctx.userId,
                client,
            });
            const end = process.hrtime.bigint();
            const durationMs = Number(end - start) / 1_000_000;

            const edgeRes = await client.query(
                `SELECT position FROM node_edges WHERE parent_id = $1 AND child_id = $2`,
                [ctx.rootNodeId, newNode.id]
            );
            expect(edgeRes.rowCount).toBe(1);
            expect(edgeRes.rows[0].position).toBe(51);

            console.log(
                `createNode (51st child) duration: ${durationMs.toFixed(2)}ms`
            );
        });
    });
});
