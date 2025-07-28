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
        RETURNING 
            id,
            user_id as "userId",
            level,
            name,
            institution,
            start_date as "startDate",
            end_date as "endDate",
            current_grade as "currentGrade",
            target_grade as "targetGrade",
            predicted_grade as "predictedGrade",
            in_progress as "inProgress",
            created_at as "created",
            updated_at as "updated"
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
    const query = `SELECT 
                    id,
                    user_id as "userId",
                    level,
                    name,
                    institution,
                    start_date as "startDate",
                    end_date as "endDate",
                    current_grade as "currentGrade",
                    target_grade as "targetGrade",
                    predicted_grade as "predictedGrade",
                    in_progress as "inProgress",
                    created_at as "created",
                    updated_at as "updated"
                 FROM qualifications
                 WHERE user_id = $1
                 ORDER BY start_date DESC`;
    const values = [userId];

    const result = await pool.query(query, values);
    return result.rows as Qualification[];
};

export const updateQualification = async (
    id: string,
    updates: Partial<NewQualification>
): Promise<Qualification> => {
    const setClause: string[] = [];
    const values: (string | number | Date | boolean | null)[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
            const dbColumn = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            setClause.push(`${dbColumn} = $${paramCount}`);
            values.push(value);
            paramCount++;
        }
    });

    if (setClause.length === 0) {
        throw new Error('No valid fields to update');
    }

    values.push(id);

    const query = `
        UPDATE qualifications 
        SET ${setClause.join(', ')}
        WHERE id = $${paramCount}
        RETURNING 
            id,
            user_id as "userId",
            level,
            name,
            institution,
            start_date as "startDate",
            end_date as "endDate",
            current_grade as "currentGrade",
            target_grade as "targetGrade",
            predicted_grade as "predictedGrade",
            in_progress as "inProgress",
            created_at as "created",
            updated_at as "updated"
    `;

    const result = await pool.query<Qualification>(query, values);

    if (result.rows.length === 0) {
        throw new Error(`Qualification with id ${id} not found`);
    }

    return result.rows[0];
};

export const deleteQualification = async (
    id: string,
    userId: string
): Promise<boolean> => {
    const query = `
        DELETE FROM qualifications 
        WHERE id = $1 AND user_id = $2
        RETURNING id
    `;

    const result = await pool.query(query, [id, userId]);

    return result.rows.length > 0;
};
