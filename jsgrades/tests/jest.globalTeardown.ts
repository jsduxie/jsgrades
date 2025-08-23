import pool from '../lib/server/db';

export default async function globalTeardown() {
    console.log('Starting global test cleanup');

    let client; // track client for release
    try {
        client = await pool.connect();
        console.log('Truncating all test tables...');
        await client.query('BEGIN');
        await client.query('SET statement_timeout = 60000');
        try {
            await client
                .query(
                    `
                SELECT pg_cancel_backend(pid)
                FROM pg_stat_activity
                WHERE datname = current_database()
                  AND pid <> pg_backend_pid()
                  AND state = 'active'
            `
                )
                .catch(() => {});
        } catch (e) {
            console.warn('Could not cancel active queries', e);
        }

        try {
            await client.query(`
                TRUNCATE TABLE 
                  qualification_nodes, node_edges, node_aggregates, tasks, 
                  qualifications, users, qualification_levels,
                  classification_bands, classification_schemes
                RESTART IDENTITY CASCADE;
            `);
            await client.query('COMMIT');
            console.log('Global database cleanup successful');
        } catch (truncateError) {
            await client.query('ROLLBACK');
            console.error('Error during global database cleanup:', truncateError);
        }
    } catch (connErr) {
        console.error('Failed to connect to test database for cleanup:', connErr);
    } finally {
        try {
            if (client) client.release();
        } catch (e) {
            console.warn('Error releasing global teardown client:', e);
        }
        try {
            await pool.end();
            console.log('Successfully closed all database connections');
        } catch (poolError) {
            console.error('Error closing database connection pool:', poolError);
        }
    }

    console.log('Global test cleanup complete');
}
