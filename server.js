const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./config/db');

// Route imports
const userRoutes = require('./routes/userRoutes');
const movieRoutes = require('./routes/movieRoutes');
const theatreRoutes = require('./routes/theatreRoutes');
const showRoutes = require('./routes/showRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Clean HTML page routing
const pagesDir = path.join(__dirname, 'public', 'pages');

app.get('/', (req, res) => res.sendFile(path.join(pagesDir, 'index.html')));
app.get('/movies', (req, res) => res.sendFile(path.join(pagesDir, 'movies.html')));
app.get('/movie-details', (req, res) => res.sendFile(path.join(pagesDir, 'movie-details.html')));
app.get('/theatres', (req, res) => res.sendFile(path.join(pagesDir, 'theatres.html')));
app.get('/shows', (req, res) => res.sendFile(path.join(pagesDir, 'shows.html')));
app.get('/seats', (req, res) => res.sendFile(path.join(pagesDir, 'seats.html')));
app.get('/confirmation', (req, res) => res.sendFile(path.join(pagesDir, 'confirmation.html')));
app.get('/my-bookings', (req, res) => res.sendFile(path.join(pagesDir, 'my-bookings.html')));
app.get('/login', (req, res) => res.sendFile(path.join(pagesDir, 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(pagesDir, 'register.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(pagesDir, 'admin.html')));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/theatres', theatreRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const [result] = await db.promise().query('SELECT 1 + 1 AS solution');
        res.json({
            status: 'online',
            service: 'Neeraj Movie Theatre Ticket Management System API',
            database: 'MySQL connected successfully',
            time: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({
            status: 'warning',
            service: 'Neeraj Movie Theatre Ticket Management System API',
            database: 'MySQL connection pending or failed',
            error: err.message
        });
    }
});

// 404 Route handler
app.use((req, res, next) => {
    if (req.accepts('html')) {
        return res.status(404).sendFile(path.join(pagesDir, 'index.html'));
    }
    res.status(404).json({ success: false, message: 'API route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error occurred.',
        error: process.env.NODE_ENV === 'production' ? null : err.message
    });
});

// Start Express Server
app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🎬 Neeraj Movie Theatre - Ticket Management System Server is Running!`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🗄️  Database: MySQL (${process.env.DB_NAME || 'movie_ticket_management'})`);
    console.log(`=======================================================`);
});
