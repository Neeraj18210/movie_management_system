const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
    console.log('🔄 Checking & initializing MySQL database tables and data...');

    const connectionConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        multipleStatements: true
    };

    let connection;
    try {
        // Connect to MySQL server (without specifying DB first to ensure DB exists)
        connection = await mysql.createConnection(connectionConfig);

        const dbName = process.env.DB_NAME || 'movie_ticket_management';
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        await connection.query(`USE \`${dbName}\`;`);

        // Check if tables already exist and have data
        const [tables] = await connection.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = ? AND table_name = 'movies'
        `, [dbName]);

        let needsSeeding = false;
        if (tables.length === 0) {
            needsSeeding = true;
        } else {
            const [movieRows] = await connection.query('SELECT COUNT(*) AS count FROM movies');
            if (movieRows[0].count === 0) {
                needsSeeding = true;
            }
        }

        if (needsSeeding) {
            console.log(`⏳ Database tables missing or empty. Loading database.sql into '${dbName}'...`);
            const sqlPath = path.join(__dirname, '..', 'database.sql');
            const sqlContent = fs.readFileSync(sqlPath, 'utf8');

            await connection.query(sqlContent);
            console.log('🎉 Database successfully populated with all 6 tables and Neeraj Movie Theatre data!');
        } else {
            console.log(`✅ Database '${dbName}' already contains tables and data.`);
        }
    } catch (err) {
        console.error('⚠️ Database Auto-Init Error:');
        console.error('   ' + err.message);
        console.log('👉 You can also execute database.sql directly inside MySQL Workbench.');
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

module.exports = initializeDatabase;
