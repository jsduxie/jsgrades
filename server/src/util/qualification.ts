import pool from '../db/conn.js';

export const getUserQualifications = async (uid: string) => {
  const query = await pool.query(
    'SELECT (id, level, name, institution, start_date, end_date, current_grade) FROM qualifications WHERE user_id = $1 ORDER BY start_date DESC',
    [uid]
  );

  return query.rows;
};
