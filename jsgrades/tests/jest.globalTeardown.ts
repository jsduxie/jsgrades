import { Pool } from 'pg';

export default async function globalTeardown() {
    console.log('Starting global test cleanup');

    try {
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL_TEST,
        });

        const client = await pool.connect();

        try {
            console.log('Truncating all test tables...');

            await client.query('BEGIN');

            await client.query('SET statement_timeout = 60000');

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
                .catch((e) => console.log('No active queries to cancel', e));

            let retries = 3;
            let success = false;

            while (retries > 0 && !success) {
                try {
                    await client.query(`
            TRUNCATE TABLE 
              qualification_nodes, node_edges, node_aggregates, tasks, 
              qualifications, users, qualification_levels, node_types,
              classification_bands, classification_schemes
            RESTART IDENTITY CASCADE;
          `);
                    success = true;
                    console.log('Global database cleanup successful');
                } catch (error) {
                    retries--;
                    if (retries > 0) {
                        console.log(
                            `Truncate failed, retrying (${retries} attempts left)...`
                        );
                        await new Promise((resolve) =>
                            setTimeout(resolve, 500)
                        );
                    } else {
                        throw error;
                    }
                }
            }

            await client.query('COMMIT');
        } catch (error) {
            console.error('Error during global database cleanup:', error);
            await client.query('ROLLBACK');
        } finally {
            client.release();

            try {
                await pool.end();
                console.log('Successfully closed all database connections');
            } catch (poolError) {
                console.error(
                    'Error closing database connection pool:',
                    poolError
                );
            }
        }
    } catch (error) {
        console.error('Failed to connect to test database for cleanup:', error);
    }

    console.log('Global test cleanup complete');
}
