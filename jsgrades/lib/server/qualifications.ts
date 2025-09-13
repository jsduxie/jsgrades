import pool from './db';
import Converter from '@/lib/Converter';
import type {
    Qualification,
    NewQualification,
    QualificationLevel,
} from '@/types';

export async function getQualifications(
    userId: string
): Promise<Qualification[]> {
    const query =
        'SELECT * FROM qualifications WHERE user_id = $1 ORDER BY start_date DESC';
    const result = await pool.query(query, [userId]);
    return result.rows.map((row) =>
        Converter.objectSnakeToCamel<Qualification>(row)
    );
}

export async function getQualificationById(
    id: string
): Promise<Qualification | null> {
    const result = await pool.query(
        'SELECT * FROM qualifications WHERE id = $1',
        [id]
    );
    if (result.rows.length === 0) return null;
    return Converter.objectSnakeToCamel<Qualification>(result.rows[0]);
}

export async function addQualification(
    qualification: NewQualification
): Promise<Qualification> {
    const query = `
            INSERT INTO qualifications (user_id, level, name, institution, start_date, end_date, current_grade,
                                        target_grade, predicted_grade, in_progress)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *;
        `;

    const values = [
        qualification.userId,
        qualification.level,
        qualification.name ?? null,
        qualification.institution ?? null,
        qualification.startDate ?? new Date(),
        qualification.endDate ?? new Date(),
        qualification.currentGrade ?? null,
        qualification.targetGrade ?? null,
        qualification.predictedGrade ?? null,
        qualification.inProgress ?? true,
    ];

    const result = await pool.query(query, values);
    return Converter.objectSnakeToCamel<Qualification>(result.rows[0]);
}

export async function updateQualification(
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

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
        throw new Error('Qualification not found');
    }
    return Converter.objectSnakeToCamel<Qualification>(result.rows[0]);
}

export async function deleteQualification(id: string): Promise<boolean> {
    const result = await pool.query(
        'DELETE FROM qualifications WHERE id = $1',
        [id]
    );
    return (result.rowCount ?? 0) > 0;
}

export async function getQualificationLevels(): Promise<QualificationLevel[]> {
    const query =
        'SELECT id, name, level FROM qualification_levels ORDER BY level ASC';
    const result = await pool.query(query);
    return result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        level: row.level,
    }));
}
