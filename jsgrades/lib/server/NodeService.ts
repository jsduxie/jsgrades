import pool from '@/lib/server/db';
import type { PoolClient } from 'pg';
import type {
    Node,
    NodeAggregate,
    UpdateGradeInput,
    NodeSettings,
    NodeSummary,
} from '@/types/qualificationNode';

export class NodeService {
    /**
     * Creates a new node and its associated aggregate, and links it to its parent.
     * @param data Node creation data including parentId, type, name, credits, and optional settings.
     * @returns The created node and its aggregate.
     */
    static async createNode(data: {
        parentId: string;
        type: string;
        name: string;
        credits?: number;
        settings?: Partial<NodeSettings>;
        qualificationId: string;
        userId: string;
    }): Promise<{ node: Node; aggregate: NodeAggregate }> {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const nodeResult = await client.query(
                `
        INSERT INTO qualification_nodes (
          qualification_id, user_id, parent_id, type, name, credits, 
          calculation_method, weighting_mode, rounding_mode, 
          rounding_precision, exclude_incomplete_from_predicted,
          inherit_settings, overrides
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `,
                [
                    data.qualificationId,
                    data.userId,
                    data.parentId,
                    data.type,
                    data.name,
                    data.credits || null,
                    data.settings?.calculationMethod || 'weighted_mean',
                    data.settings?.weightingMode || 'equal',
                    data.settings?.roundingMode || 'none',
                    data.settings?.roundingPrecision || 2,
                    data.settings?.excludeIncompleteFromPredicted ?? true,
                    data.settings?.inheritSettings ?? true,
                    JSON.stringify(data.settings?.overrides || {}),
                ]
            );

            const node = this._mapNodeFromDb(nodeResult.rows[0]);

            await client.query(
                `
        INSERT INTO node_edges (parent_id, child_id, position)
        VALUES ($1, $2, (
          SELECT COALESCE(MAX(position), 0) + 1 
          FROM node_edges 
          WHERE parent_id = $1
        ))
      `,
                [data.parentId, node.id]
            );

            await client.query(
                `
        INSERT INTO node_aggregates (node_id, child_counts, effective_settings)
        VALUES ($1, '{}'::jsonb, '{}'::jsonb)
      `,
                [node.id]
            );

            await this._propagateRecalculation(client, data.parentId);

            const aggregate = await this._getNodeAggregate(client, node.id);

            await client.query('COMMIT');
            return { node, aggregate };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Retrieves a complete node summary, including node data, computed aggregate, and effective settings.
     * @param nodeId The ID of the node to retrieve.
     * @returns The node summary.
     */
    static async getNode(nodeId: string): Promise<NodeSummary> {
        const client = await pool.connect();

        try {
            const nodeResult = await client.query(
                `
        SELECT * FROM qualification_nodes WHERE id = $1
      `,
                [nodeId]
            );

            if (nodeResult.rows.length === 0) {
                throw new Error('Node not found');
            }

            const node = this._mapNodeFromDb(nodeResult.rows[0]);
            const aggregate = await this._getNodeAggregate(client, nodeId);
            const effectiveSettings = await this._resolveEffectiveSettings(
                client,
                nodeId
            );

            return { node, aggregate, effectiveSettings };
        } finally {
            client.release();
        }
    }

    /**
     * Updates actual, predicted, or target grade for a node and propagates up the tree to recompute parent aggregates.
     * @param input Grade update input.
     * @returns The updated node and its aggregate.
     */
    static async updateGrade(
        input: UpdateGradeInput
    ): Promise<{ node: Node; aggregate: NodeAggregate }> {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            let updateQuery = '';
            const params: [string, number | null] = [input.nodeId, null];

            switch (input.kind) {
                case 'actual':
                    updateQuery =
                        'UPDATE qualification_nodes SET current_grade = $2 WHERE id = $1';
                    params[1] =
                        input.value !== undefined && input.value !== null
                            ? Number(input.value)
                            : null;
                    break;
                case 'predicted':
                    updateQuery =
                        'UPDATE qualification_nodes SET predicted_grade = $2 WHERE id = $1';
                    params[1] =
                        input.value !== undefined && input.value !== null
                            ? Number(input.value)
                            : null;
                    break;
                case 'target':
                    updateQuery =
                        'UPDATE qualification_nodes SET target_grade = $2 WHERE id = $1';
                    params[1] =
                        input.value !== undefined && input.value !== null
                            ? Number(input.value)
                            : null;
                    break;
            }

            await client.query(updateQuery, params);

            if (input.completed !== undefined) {
                await client.query(
                    'UPDATE qualification_nodes SET in_progress = $2 WHERE id = $1',
                    [input.nodeId, !input.completed]
                );
            }

            await this._propagateRecalculation(client, input.nodeId);

            const nodeResult = await client.query(
                'SELECT * FROM qualification_nodes WHERE id = $1',
                [input.nodeId]
            );

            const node = this._mapNodeFromDb(nodeResult.rows[0]);
            const aggregate = await this._getNodeAggregate(
                client,
                input.nodeId
            );

            await client.query('COMMIT');
            return { node, aggregate };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Returns immediate child nodes for a given parent node.
     * @param nodeId The parent node ID.
     * @param includeAggregates Whether to include aggregates for each child.
     * @returns Array of child nodes, optionally with aggregates.
     */
    static async getChildren(
        nodeId: string,
        includeAggregates = false
    ): Promise<Array<{ node: Node; aggregate?: NodeAggregate }>> {
        const client = await pool.connect();

        try {
            const result = await client.query(
                `
        SELECT qn.* 
        FROM qualification_nodes qn
        INNER JOIN node_edges ne ON qn.id = ne.child_id
        WHERE ne.parent_id = $1
        ORDER BY ne.position ASC
      `,
                [nodeId]
            );

            const children = [];
            for (const row of result.rows) {
                const node = this._mapNodeFromDb(row);
                const child: { node: Node; aggregate?: NodeAggregate } = {
                    node,
                };

                if (includeAggregates) {
                    child.aggregate = await this._getNodeAggregate(
                        client,
                        node.id
                    );
                }

                children.push(child);
            }

            return children;
        } finally {
            client.release();
        }
    }

    /**
     * Retrieves cached aggregate data for a node.
     * @param client The database client.
     * @param nodeId The node ID.
     * @returns The node aggregate.
     * @private
     */
    private static async _getNodeAggregate(
        client: PoolClient,
        nodeId: string
    ): Promise<NodeAggregate> {
        const result = await client.query(
            `
      SELECT * FROM node_aggregates WHERE node_id = $1
    `,
            [nodeId]
        );

        if (result.rows.length === 0) {
            throw new Error('Node aggregate not found');
        }

        return this._mapAggregateFromDb(result.rows[0]);
    }

    /**
     * Traverses node hierarchy to resolve inherited settings with overrides.
     * @param client The database client.
     * @param nodeId The node ID.
     * @returns The resolved effective settings.
     * @private
     */
    private static async _resolveEffectiveSettings(
        client: PoolClient,
        nodeId: string
    ): Promise<NodeSettings> {
        const result = await client.query(
            `
        WITH RECURSIVE node_hierarchy AS (
            SELECT id, parent_id, calculation_method, weighting_mode, 
                   rounding_mode, rounding_precision, exclude_incomplete_from_predicted,
                   inherit_settings, overrides, 0 as level
            FROM qualification_nodes 
            WHERE id = $1
            
            UNION ALL
            
            SELECT qn.id, qn.parent_id, qn.calculation_method, qn.weighting_mode,
                   qn.rounding_mode, qn.rounding_precision, qn.exclude_incomplete_from_predicted,
                   qn.inherit_settings, qn.overrides, nh.level + 1
            FROM qualification_nodes qn
            INNER JOIN node_hierarchy nh ON qn.id = nh.parent_id
            WHERE nh.inherit_settings = true AND nh.level < 10
        )
        SELECT * FROM node_hierarchy ORDER BY level ASC
        `,
            [nodeId]
        );

        if (result.rows.length === 0) {
            throw new Error('Node not found for settings resolution');
        }

        const effectiveSettings: NodeSettings = {
            calculationMethod: 'weighted_mean',
            weightingMode: 'equal',
            roundingMode: 'none',
            roundingPrecision: 2,
            excludeIncompleteFromPredicted: true,
            inheritSettings: true,
            overrides: {},
        };

        for (const row of result.rows.reverse()) {
            if (row.calculation_method)
                effectiveSettings.calculationMethod = row.calculation_method;
            if (row.weighting_mode)
                effectiveSettings.weightingMode = row.weighting_mode;
            if (row.rounding_mode)
                effectiveSettings.roundingMode = row.rounding_mode;
            if (row.rounding_precision !== null)
                effectiveSettings.roundingPrecision = row.rounding_precision;
            if (row.exclude_incomplete_from_predicted !== null)
                effectiveSettings.excludeIncompleteFromPredicted =
                    row.exclude_incomplete_from_predicted;
            if (row.inherit_settings !== null)
                effectiveSettings.inheritSettings = row.inherit_settings;
            if (row.overrides)
                effectiveSettings.overrides = {
                    ...effectiveSettings.overrides,
                    ...JSON.parse(row.overrides),
                };
        }

        return effectiveSettings;
    }

    /**
     * Triggers recalculation of aggregates for a node and its parents.
     * @param client The database client.
     * @param nodeId The node ID.
     * @returns void
     * @private
     */
    private static async _propagateRecalculation(
        client: PoolClient,
        nodeId: string
    ): Promise<void> {
        await client.query(
            `
      UPDATE node_aggregates 
      SET last_computed_at = NOW() 
      WHERE node_id = $1
    `,
            [nodeId]
        );
    }

    /**
     * Converts a DB row to a Node object.
     * @param row The database row.
     * @returns The Node object.
     * @private
     */
    private static _mapNodeFromDb(row: Record<string, unknown>): Node {
        return {
            id: row.id as string,
            qualificationId: row.qualification_id as string,
            userId: row.user_id as string,
            parentId:
                row.parent_id !== undefined
                    ? (row.parent_id as string | null)
                    : null,
            name: row.name as string,
            type: row.type as string,
            weight:
                row.weight !== undefined
                    ? row.weight !== null
                        ? Number(row.weight)
                        : null
                    : null,
            credits:
                row.credits !== undefined
                    ? row.credits !== null
                        ? Number(row.credits)
                        : null
                    : null,
            calculationMethod:
                row.calculation_method as Node['calculationMethod'],
            weightingMode: row.weighting_mode as Node['weightingMode'],
            roundingMode: row.rounding_mode as Node['roundingMode'],
            roundingPrecision:
                row.rounding_precision !== undefined &&
                row.rounding_precision !== null
                    ? Number(row.rounding_precision)
                    : 2,
            excludeIncompleteFromPredicted:
                row.exclude_incomplete_from_predicted !== undefined
                    ? Boolean(row.exclude_incomplete_from_predicted)
                    : true,
            inheritSettings:
                row.inherit_settings !== undefined
                    ? Boolean(row.inherit_settings)
                    : true,
            overrides: row.overrides
                ? typeof row.overrides === 'string'
                    ? JSON.parse(row.overrides as string)
                    : row.overrides
                : {},
            creditEnforcement: row.credit_enforcement
                ? (row.credit_enforcement as Node['creditEnforcement'])
                : 'none',
            configStatus: row.config_status
                ? (row.config_status as Node['configStatus'])
                : 'draft',
            lockConfig:
                row.lock_config !== undefined
                    ? Boolean(row.lock_config)
                    : false,
            currentGrade:
                row.current_grade !== undefined && row.current_grade !== null
                    ? Number(row.current_grade)
                    : null,
            targetGrade:
                row.target_grade !== undefined && row.target_grade !== null
                    ? Number(row.target_grade)
                    : null,
            predictedGrade:
                row.predicted_grade !== undefined &&
                row.predicted_grade !== null
                    ? Number(row.predicted_grade)
                    : null,
            inProgress:
                row.in_progress !== undefined && row.in_progress !== null
                    ? Boolean(row.in_progress)
                    : false,
            startDate: row.start_date
                ? new Date(row.start_date as string)
                : null,
            endDate: row.end_date ? new Date(row.end_date as string) : null,
            createdAt: row.created_at
                ? new Date(row.created_at as string)
                : new Date(),
            updatedAt: row.updated_at
                ? new Date(row.updated_at as string)
                : new Date(),
        };
    }

    /**
     * Converts a DB row to a NodeAggregate object.
     * @param row The database row.
     * @returns The NodeAggregate object.
     * @private
     */
    private static _mapAggregateFromDb(
        row: Record<string, unknown>
    ): NodeAggregate {
        return {
            nodeId: row.node_id as string,
            aggActual: row.agg_actual !== null ? Number(row.agg_actual) : null,
            aggPredicted:
                row.agg_predicted !== null ? Number(row.agg_predicted) : null,
            aggCompletionRatio:
                row.agg_completion_ratio !== null
                    ? Number(row.agg_completion_ratio)
                    : null,
            childCounts:
                typeof row.child_counts === 'string'
                    ? JSON.parse(row.child_counts)
                    : (row.child_counts as Record<string, unknown>) || {},
            effectiveSettings:
                typeof row.effective_settings === 'string'
                    ? JSON.parse(row.effective_settings)
                    : (row.effective_settings as Record<string, unknown>) || {},
            creditSumExpected:
                row.credit_sum_expected !== null
                    ? Number(row.credit_sum_expected)
                    : null,
            creditSumActual:
                row.credit_sum_actual !== null
                    ? Number(row.credit_sum_actual)
                    : null,
            configCoverage:
                row.config_coverage !== null
                    ? Number(row.config_coverage)
                    : null,
            validationCodes: Array.isArray(row.validation_codes)
                ? (row.validation_codes as string[])
                : [],
            validationMeta:
                typeof row.validation_meta === 'string'
                    ? JSON.parse(row.validation_meta)
                    : (row.validation_meta as Record<string, unknown>) || {},
            classificationActual: row.classification_actual as string | null,
            classificationPredicted: row.classification_predicted as
                | string
                | null,
            lastComputedAt: row.last_computed_at
                ? new Date(row.last_computed_at as string)
                : new Date(),
        };
    }
}
