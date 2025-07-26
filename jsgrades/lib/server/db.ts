import { Pool } from 'pg';

const status = process.env.STATUS || 'DEV';
const db_url =
    status === 'PROD'
        ? process.env.DATABASE_URL_PROD
        : process.env.DATABASE_URL_DEV || process.env.DATABASE_URL;

const pool = new Pool({
    connectionString: db_url,
    ssl: {
        rejectUnauthorized: false,
    },
});

export default pool;
