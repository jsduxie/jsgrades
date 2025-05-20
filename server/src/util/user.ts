// Utility functions for /user route

import pool from '../db/conn.js';

export const getUserDetails = async (uid : string) => {
    const userQuery = await pool.query('SELECT * FROM users WHERE uid = $1', [uid]);

    if (userQuery.rows.length === 0) {
        return {};
    } else {
        return userQuery.rows[0];
    }
}