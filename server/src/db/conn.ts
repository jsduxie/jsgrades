import { Pool } from 'pg';

const status = process.env.STATUS;
const db_url =
  status === 'PROD'
    ? process.env.DATABASE_URL_PROD
    : process.env.DATABASE_URL_DEV;

const pool = new Pool({
  connectionString: db_url,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;
