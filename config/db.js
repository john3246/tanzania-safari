const { Pool } = require('pg');
require('dotenv').config();

// Connect using the DATABASE_URL environment variable
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
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