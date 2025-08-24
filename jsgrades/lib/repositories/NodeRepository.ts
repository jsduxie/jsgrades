import { PoolClient } from 'pg';
import { CreateNodeInput } from '@/types/NodeRepository';
import Converter from '@/lib/Converter';

export default class NodeRepository {
    private dbClient: PoolClient;

    constructor(dbClient: PoolClient) {
        this.dbClient = dbClient;
    }
    async getNodeById(id: string): Promise<Node | null> {
        const query = 'SELECT * FROM qualification_nodes WHERE id = $1';

        const result = await this.dbClient.query(query, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    }

    async getChildren(parentId: string): Promise<Node[]> {
        const query = 'SELECT * FROM qualification_nodes WHERE parent_id = $1';

        const result = await this.dbClient.query(query, [parentId]);

        return result.rows;
    }
    async createNode(input: CreateNodeInput): Promise<Node> {
        const query = `
            INSERT INTO qualification_nodes (
                qualification_id, user_id, parent_id, name, type,
                weight, credits, calculation_method, weighting_mode,
                rounding_mode, rounding_precision, exclude_incomplete_from_predicted,
                inherit_settings, overrides, credit_enforcement, config_status,
                lock_config, current_grade, target_grade, predicted_grade,
                in_progress, start_date, end_date
            )
            VALUES (
                       $1, $2, $3, $4, $5,
                       $6, $7, $8, $9,
                       $10, $11, $12,
                       $13, $14, $15, $16,
                       $17, $18, $19, $20,
                       $21, $22, $23
                   )
            RETURNING *;
        `;

        const values = [
            input.qualificationId,
            input.userId,
            input.parentId ?? null,
            input.name,
            input.type,
            input.weight ?? null,
            input.credits ?? null,
            input.calculationMethod ?? undefined,
            input.weightingMode ?? undefined,
            input.roundingMode ?? undefined,
            input.roundingPrecision ?? undefined,
            input.excludeIncompleteFromPredicted ?? undefined,
            input.inheritSettings ?? undefined,
            input.overrides ?? {},
            input.creditEnforcement ?? undefined,
            input.configStatus ?? undefined,
            input.lockConfig ?? undefined,
            input.currentGrade ?? null,
            input.targetGrade ?? null,
            input.predictedGrade ?? null,
            input.inProgress ?? undefined,
            input.startDate ?? undefined,
            input.endDate ?? undefined,
        ];

        const result = await this.dbClient.query(query, values);
        return result.rows[0];
    }

    async updateNode(id: string, updates: Partial<Node>): Promise<Node> {
        const keys = Object.keys(updates) as (keyof Node)[];

        if (keys.length === 0) {
            throw new Error('No updates provided');
        }

        const setClauses = keys.map(
            (key, idx) => `${Converter.camelToSnake(key)} = $${idx + 1}`
        );

        const values = keys.map((key) =>
            updates[key] === undefined ? null : updates[key]
        );

        const query = `
            UPDATE qualification_nodes
            SET ${setClauses.join(', ')}
            WHERE id = $${keys.length + 1}
            RETURNING *;
        `;

        const result = await this.dbClient.query(query, [...values, id]);

        if (result.rows.length === 0) {
            throw new Error(`Node with id ${id} not found`);
        }

        return result.rows[0] as Node;
    }

    async deleteNode(id: string): Promise<void> {
        const query = 'DELETE FROM qualification_nodes WHERE id = $1';
        await this.dbClient.query(query, [id]);
        return;
    }
}
