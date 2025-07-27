import pool from './db';
import { Qualification, QualificationLevel, NewQualification } from '@/types';

export const getQualificationLevels = async (): Promise<
    QualificationLevel[]
> => {
    const result = await pool.query(
        'SELECT id, name, level FROM qualification_levels ORDER BY level ASC'
    );
    return result.rows;
};

export const addQualification = async (
    q: NewQualification
): Promise<Qualification> => {
    const query = `
        INSERT INTO qualifications (
            user_id,
            level,
            name,
            institution,
            start_date,
            end_date,
            current_grade,
            target_grade,
            predicted_grade,
            in_progress
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        )
        RETURNING *
    `;

    const values = [
        q.userId,
        q.level,
        q.name,
        q.institution,
        q.startDate ?? new Date(),
        q.endDate ?? new Date(),
        q.currentGrade ?? null,
        q.targetGrade ?? null,
        q.predictedGrade ?? null,
        q.inProgress ?? true,
    ];

    const result = await pool.query<Qualification>(query, values);
    return result.rows[0];
};

export const getQualifications = async (
    userId: string
): Promise<Qualification[]> => {
    const query = `SELECT *
                 FROM qualifications
                 WHERE user_id = $1
                 ORDER BY start_date DESC`;
    const values = [userId];

    const result = await pool.query(query, values);
    return result.rows as Qualification[];
};
