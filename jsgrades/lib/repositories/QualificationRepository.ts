import type { Qualification} from '@/types/qualification'
import { PoolClient } from 'pg';
import Converter from '@/lib/Converter';

export class QualificationRepository {
    private dbClient: PoolClient;

    constructor(dbClient: PoolClient) {
        this.dbClient = dbClient;
    }
    async getQualificationById(id: string): Promise<Qualification | null> {
        const query = 'SELECT * FROM qualifications WHERE id = $1';
        const result = await this.dbClient.query(query, [id]);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    }

    async getAllUserQualifications(userId: string): Promise<Qualification[]> {
        const query = 'SELECT * FROM qualifications WHERE user_id = $1';
        const result = await this.dbClient.query(query, [userId]);
        return result.rows;
    }

    async createQualification(input: Partial<Qualification>): Promise<Qualification> {
        const query = `
            INSERT INTO qualifications (user_id, level, name, institution, start_date, end_date, current_grade,
                                        target_grade, predicted_grade, in_progress)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *;
        `;

        const values = [
            input.userId,
            input.level,
            input.name ?? null,
            input.institution ?? null,
            input.startDate ?? Date.now(),
            input.endDate ?? Date.now(),
            input.currentGrade ?? null,
            input.targetGrade ?? null,
            input.predictedGrade ?? null,
            input.inProgress ?? true,
        ];

        const result = await this.dbClient.query(query, values);
        return result.rows[0];
    }

    async updateQualification(id: string, updates: Partial<Qualification>): Promise<Qualification> {
        const keys = Object.keys(updates) as (keyof Qualification)[];

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
            UPDATE qualifications
            SET ${setClauses.join(', ')}
            WHERE id = $${keys.length + 1}
            RETURNING *;
        `;

        const result = await this.dbClient.query(query, [...values, id]);

        if (result.rows.length === 0) {
            throw new Error(`Qualification with id ${id} not found`);
        }

        return result.rows[0] as Qualification;
    }

    async deleteQualification(id: string): Promise<void> {
        const query = 'DELETE FROM qualifications WHERE id = $1';
        await this.dbClient.query(query, [id]);
        return;
    }
}