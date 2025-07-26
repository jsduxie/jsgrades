import { Pool } from 'pg';

const status = process.env.NODE_ENV;
const db_url =
    status === 'production'
        ? process.env.DATABASE_URL_PROD
        : process.env.DATABASE_URL_DEV;

if (!db_url) {
    throw new Error('Database URL is not configured in environment variables');
}

const pool = new Pool({
    connectionString: db_url,
    ssl:
        process.env.NODE_ENV === 'production'
            ? {
                  rejectUnauthorized: false,
              }
            : false,
});

export default pool;
