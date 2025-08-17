import { Pool } from 'pg';

let connectionString = process.env.DATABASE_URL;

if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
    connectionString = process.env.DATABASE_URL_TEST;
} else if (process.env.NODE_ENV === 'production') {
    connectionString = process.env.DATABASE_URL_PROD;
} else if (process.env.NODE_ENV === 'development') {
    connectionString = process.env.DATABASE_URL_DEV;
}

const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false,
    },
});

export default pool;
