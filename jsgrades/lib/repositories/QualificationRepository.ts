import type { Qualification } from '@/types/qualification';
import { PoolClient } from 'pg';
import Converter from '@/lib/Converter';

export default class QualificationRepository {
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
        return Converter.objectSnakeToCamel<Qualification>(result.rows[0]);
    }

    async getAllUserQualifications(userId: string): Promise<Qualification[]> {
        const query =
            'SELECT * FROM qualifications WHERE user_id = $1 ORDER BY start_date DESC';
        const result = await this.dbClient.query(query, [userId]);
        return result.rows.map((row) =>
            Converter.objectSnakeToCamel<Qualification>(row)
        );
    }

    async createQualification(
        input: Partial<Qualification>
    ): Promise<Qualification> {
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
        return Converter.objectSnakeToCamel<Qualification>(result.rows[0]);
    }

    async updateQualification(
        id: string,
        updates: Partial<Qualification>
    ): Promise<Qualification> {
        const setParts: string[] = [];
        const values: unknown[] = [];
        let paramIndex = 1;

        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) {
                const snakeKey = Converter.camelToSnake(key);
                setParts.push(`${snakeKey} = $${paramIndex++}`);
                values.push(value);
            }
        }

        setParts.push(`updated_at = CURRENT_TIMESTAMP`);

        if (setParts.length === 1) {
            throw new Error('No fields to update');
        }

        const query = `
            UPDATE qualifications 
            SET ${setParts.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *;
        `;
        values.push(id);

        const result = await this.dbClient.query(query, values);

        if (result.rows.length === 0) {
            throw new Error('Qualification not found');
        }

        return Converter.objectSnakeToCamel<Qualification>(result.rows[0]);
    }

    async deleteQualification(id: string): Promise<void> {
        const query = 'DELETE FROM qualifications WHERE id = $1';
        await this.dbClient.query(query, [id]);
        return;
    }
}
