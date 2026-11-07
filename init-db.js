// ============================================================
// NEERAJ MOVIE THEATRE - DATABASE SEED & INITIALIZATION RUNNER
// ============================================================

const initializeDatabase = require('./config/initDb');

(async () => {
    console.log('=======================================================');
    console.log('🚀 Executing Database Migration & Seed for MySQL...');
    console.log('=======================================================');
    
    await initializeDatabase();
    
    console.log('=======================================================');
    console.log('✨ All done! Your MySQL database is ready for bookings.');
    console.log('=======================================================');
    process.exit(0);
})();
