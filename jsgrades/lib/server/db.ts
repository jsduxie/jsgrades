import { Pool } from 'pg';

const status =
    process.env.NODE_ENV === 'test' ? 'DEV' : process.env.STATUS || 'DEV';
const db_url =
    status === 'PROD'
        ? process.env.DATABASE_URL_PROD
        : process.env.DATABASE_URL_DEV;

if (!db_url) {
    const envVarName =
        status === 'PROD' ? 'DATABASE_URL_PROD' : 'DATABASE_URL_DEV';
    throw new Error(`Missing required environment variable: ${envVarName}`);
}

const pool = new Pool({
    connectionString: db_url,
    ssl: {
        rejectUnauthorized: false,
    },
});

export default pool;
