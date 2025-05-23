// Utility functions for /user route

import pool from '../db/conn.js';

export const getUserDetails = async (uid: string) => {
    const userQuery = await pool.query('SELECT * FROM users WHERE uid = $1', [uid]);

    if (userQuery.rows.length === 0) {
        return {};
    } else {
        return userQuery.rows[0];
    }
}

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
      uid, email, first_name, last_name, date_of_birth, highest_qual_level, verified, onBoarded, count_sign_in
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;

  const values = [
    uid,
    email,
    first_name || null,
    last_name || null,
    date_of_birth || null,
    highest_qual_level || null,
    verified,
    onBoarded,
    count_sign_in,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};