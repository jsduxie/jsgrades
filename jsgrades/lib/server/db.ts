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
    // Improved connection pool configuration for better reliability
    max: 10, // Reduce max connections to prevent overwhelming the database
    min: 1, // Keep at least one connection alive
    idleTimeoutMillis: 60000, // Keep connections alive longer (60 seconds)
    connectionTimeoutMillis: 10000, // Increase connection timeout to 10 seconds
    query_timeout: 60000, // Increase query timeout to 60 seconds
    statement_timeout: 60000, // Increase statement timeout to 60 seconds
    // Add connection retry logic
    acquireTimeoutMillis: 15000, // Wait up to 15 seconds to acquire a connection
    createTimeoutMillis: 8000, // Timeout for creating new connections
    destroyTimeoutMillis: 5000, // Timeout for destroying connections
    reapIntervalMillis: 1000, // Check for idle connections every second
    createRetryIntervalMillis: 200, // Retry connection creation every 200ms
});

export default pool;
