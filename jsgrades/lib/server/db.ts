import { Pool } from 'pg';

const status =
    process.env.NODE_ENV === 'test' ? 'DEV' : process.env.STATUS || 'DEV';
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
