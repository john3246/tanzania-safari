const { Pool } = require('pg');
require('dotenv').config();

// Connect using the DATABASE_URL environment variable
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 3000,
    statement_timeout: 2500,
    query_timeout: 2500
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

pool.on('connect', (client) => {
    client.query('SET statement_timeout = 2500').catch(() => {});
});

// Test connection immediately
pool.query('SELECT NOW()', (err, result) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Database connected successfully at:', result.rows[0].now);
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};