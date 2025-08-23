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
    // Connection pool configuration for better test performance
    max: 20, // Maximum number of connections in the pool
    min: 2, // Minimum number of connections in the pool
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 5000, // Timeout after 5 seconds if connection cannot be established
    query_timeout: 30000, // Query timeout after 30 seconds
    statement_timeout: 30000, // Statement timeout after 30 seconds
});

export default pool;
