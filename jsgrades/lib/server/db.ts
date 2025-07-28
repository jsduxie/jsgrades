import { Pool } from 'pg';

const status = process.env.STATUS || 'DEV';
let db_url =
    status === 'PROD'
        ? process.env.DATABASE_URL_PROD
        : process.env.DATABASE_URL_DEV;

if (process.env.NODE_ENV === 'test') {
    console.log('Database connection debug:');
    console.log('STATUS:', status);
    console.log('DATABASE_URL_DEV exists:', !!process.env.DATABASE_URL_DEV);
    console.log('DATABASE_URL_PROD exists:', !!process.env.DATABASE_URL_PROD);
    if (db_url) {
        const urlWithMaskedPassword = db_url.replace(/:([^@]+)@/, ':***@');
        console.log('Connection URL (masked):', urlWithMaskedPassword);
    } else {
        console.log('ERROR: No database URL found!');
    }
}

if (!db_url) {
    const envVarName = status === 'PROD' ? 'DATABASE_URL_PROD' : 'DATABASE_URL_DEV';
    throw new Error(`Missing required environment variable: ${envVarName}`);
}

if (db_url) {
    try {
        if (db_url.includes('%')) {
            db_url = decodeURIComponent(db_url);
            if (process.env.NODE_ENV === 'test') {
                const decodedMasked = db_url.replace(/:([^@]+)@/, ':***@');
                console.log('Decoded URL (masked):', decodedMasked);
            }
        }
    } catch (error) {
        console.warn('URL decoding failed, using original URL:', error);
    }
}

const pool = new Pool({
    connectionString: db_url,
    ssl: {
        rejectUnauthorized: false,
    },
});

export default pool;
