const bcrypt = require('bcrypt');
const db = require('./config/db');

async function createAdmin(email, plaintextPassword, firstName, lastName) {
    try {
        console.log(`Setting up admin account for: ${email}...`);

        // 1. Get the Admin role_id
        const roleResult = await db.query("SELECT role_id FROM user_roles WHERE role_name = 'Admin'");
        if (roleResult.rows.length === 0) {
            throw new Error("Admin role not found in the 'user_roles' table. Please ensure your database is seeded.");
        }
        const adminRoleId = roleResult.rows[0].role_id;

        // 2. Hash the password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(plaintextPassword, saltRounds);

        // 3. Insert the user
        const insertQuery = `
            INSERT INTO users (email, password_hash, first_name, last_name, role_id, is_active, created_at)
            VALUES ($1, $2, $3, $4, $5, true, NOW())
            RETURNING user_id, email
        `;
        const result = await db.query(insertQuery, [email, passwordHash, firstName, lastName, adminRoleId]);

        console.log("✅ Admin account created successfully!");
        console.log(`User ID: ${result.rows[0].user_id}`);
        console.log(`Email: ${result.rows[0].email}`);

    } catch (error) {
        if (error.code === '23505') { // PostgreSQL unique violation code
            console.error(`❌ Error: An account with the email '${email}' already exists.`);
        } else {
            console.error("❌ Failed to create admin account:", error.message);
        }
    } finally {
        process.exit(0); // Exit the script, closing the DB pool
    }
}

// Retrieve arguments from the command line
const email = process.argv[2];
const password = process.argv[3];
const firstName = process.argv[4] || 'Super';
const lastName = process.argv[5] || 'Admin';

if (!email || !password) {
    console.log("Usage: node create-admin.js <email> <password> [firstName] [lastName]");
    console.log("Example: node create-admin.js admin@tanzaniasafari.com mySecureP@ssw0rd John Doe");
    process.exit(1);
}

createAdmin(email, password, firstName, lastName);
