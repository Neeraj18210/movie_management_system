const mysql = require('mysql2');
require('dotenv').config();

// Create connection pool for reliable multi-user transactions and queries
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'movie_ticket_management',
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    decimalNumbers: true
});

// Test connection on startup
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ MySQL Connection Failed:');
        console.error(`   Code: ${err.code}`);
        console.error(`   Message: ${err.message}`);
        console.error('\n👉 Tips to resolve:');
        console.error('   1. Ensure MySQL Server is running in MySQL Workbench / Windows Services.');
        console.error('   2. Verify username and password in .env match your MySQL setup.');
        console.error('   3. Run the database.sql script in MySQL Workbench to initialize tables.\n');
        return;
    }
    console.log('✅ MySQL Connected Successfully to database:', process.env.DB_NAME || 'movie_ticket_management');
    connection.release();
});

// Export both standard pool and promise pool for modern async/await
module.exports = pool;
