require('dotenv').config();
const { Pool } = require('pg');

console.log('Environment variables loaded:');
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_DATABASE:', process.env.DB_DATABASE);
console.log('DB_PASSWORD exists:', process.env.DB_PASSWORD ? 'Yes' : 'No');
console.log('DB_PASSWORD length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0);
console.log('---');

// Create pool with explicit configuration
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD || ''), // Ensure it's a string
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_DATABASE || 'madetzsafari',
    max: 10,
    connectionTimeoutMillis: 10000,
});

async function testConnection() {
    let client;
    try {
        console.log('Attempting to connect to PostgreSQL...');
        client = await pool.connect();
        console.log('✅ Connected successfully!');
        
        // Test query
        const result = await client.query('SELECT NOW() as current_time, version() as version');
        console.log('Current time:', result.rows[0].current_time);
        console.log('PostgreSQL version:', result.rows[0].version.split(',')[0]);
        
        // Check if tables exist
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('safari_packages', 'national_parks', 'package_categories')
        `);
        
        console.log('\nExisting tables:', tables.rows.map(r => r.table_name).join(', ') || 'None found');
        
        // Count packages
        if (tables.rows.some(r => r.table_name === 'safari_packages')) {
            const packages = await client.query('SELECT COUNT(*) FROM safari_packages WHERE is_active = true');
            console.log(`📦 Active packages: ${packages.rows[0].count}`);
        } else {
            console.log('⚠️  safari_packages table not found - need to run the SQL schema');
        }
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.log('\nPossible solutions:');
        console.log('1. Make sure PostgreSQL is running:');
        console.log('   - Windows: Check Services > "postgresql"');
        console.log('   - Run: net start postgresql');
        console.log('2. Verify password in .env file');
        console.log('3. Try connecting with psql:');
        console.log('   psql -U postgres -h localhost -p 5432 -d postgres');
        console.log('4. If password is empty, set it:');
        console.log('   ALTER USER postgres WITH PASSWORD \'postgres\';');
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

testConnection();