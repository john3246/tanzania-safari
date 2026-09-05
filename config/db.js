const { Pool } = require('pg');
require('dotenv').config();

function sslConfig() {
    const url = process.env.DATABASE_URL || '';
    const sslMode = (process.env.PGSSLMODE || '').toLowerCase();
    if (sslMode === 'disable' || /sslmode=disable/i.test(url)) {
        return false;
    }
    if (/localhost|127\.0\.0\.1/.test(url)) {
        return false;
    }
    return process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false;
}

// Connect using the DATABASE_URL environment variable
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: sslConfig(),
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

// Handle pool errors
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};