import pool from './db';
import { ClientUserDetails, DBUserDetails } from '@/types';

export const getUser = async (
    uid: string
): Promise<Partial<ClientUserDetails>> => {
    const userQuery = await pool.query('SELECT * FROM users WHERE uid = $1', [
        uid,
    ]);

    if (userQuery.rows.length === 0) {
        return {};
    } else {
        const row = userQuery.rows[0];
        return {
            uid: row.uid,
            id: row.id,
            email: row.email,
            firstName: row.first_name ?? undefined,
            lastName: row.last_name ?? undefined,
            dateOfBirth: row.date_of_birth
                ? new Date(row.date_of_birth)
                : undefined,
            verified: row.verified ?? undefined,
            onBoarded: row.onboarded ?? undefined,
        };
    }
};

export const addUser = async ({
    uid,
    email,
    first_name,
    last_name,
    date_of_birth,
    highest_qual_level = null,
    verified = false,
    onBoarded = false,
    count_sign_in = 0,
}: {
    uid: string;
    email: string;
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    highest_qual_level?: number | null;
    verified?: boolean;
    onBoarded?: boolean;
    count_sign_in?: number;
}) => {
    const query = `
    INSERT INTO users (
      uid, email, first_name, last_name, date_of_birth, highest_qual_level, profile_picture, verified, onBoarded, count_sign_in
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;

    const values = [
        uid,
        email,
        first_name || null,
        last_name || null,
        date_of_birth || null,
        highest_qual_level || null,
        null, // profile_picture
        verified,
        onBoarded,
        count_sign_in,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

export const updateUser = async (
    uid: string,
    updates: Partial<DBUserDetails>
) => {
    const setClause = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');

    const query = `
    UPDATE users 
    SET ${setClause}
    WHERE uid = $1
    RETURNING *
  `;

    const values = [uid, ...Object.values(updates)];
    const result = await pool.query(query, values);
    return result.rows[0];
};
