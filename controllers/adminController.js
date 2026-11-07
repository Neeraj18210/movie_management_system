const db = require('../config/db');
const promiseDb = db.promise();

// Get aggregated admin dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        // 1. Total counts
        const [movieCount] = await promiseDb.query('SELECT COUNT(*) AS total FROM movies');
        const [theatreCount] = await promiseDb.query('SELECT COUNT(*) AS total FROM theatres');
        const [showCount] = await promiseDb.query('SELECT COUNT(*) AS total FROM shows');
        const [userCount] = await promiseDb.query("SELECT COUNT(*) AS total FROM users WHERE role = 'customer'");
        const [bookingCount] = await promiseDb.query('SELECT COUNT(*) AS total FROM bookings');
        
        // 2. Revenue calculation
        const [revenueResult] = await promiseDb.query(
            "SELECT COALESCE(SUM(total_amount), 0) AS total_revenue FROM bookings WHERE booking_status = 'CONFIRMED'"
        );

        // 3. Total tickets/seats booked
        const [seatsResult] = await promiseDb.query(
            "SELECT COALESCE(SUM(seats), 0) AS total_seats_sold FROM bookings WHERE booking_status = 'CONFIRMED'"
        );

        // 4. Recent bookings (latest 5)
        const [recentBookings] = await promiseDb.query(`
            SELECT 
                b.booking_id,
                b.booking_reference,
                b.seats,
                b.total_amount,
                b.booking_status,
                b.created_at,
                u.name AS customer_name,
                m.title AS movie_title,
                s.theatre_name
            FROM bookings b
            JOIN users u ON b.user_id = u.user_id
            JOIN shows s ON b.show_id = s.show_id
            JOIN movies m ON s.movie_id = m.movie_id
            ORDER BY b.created_at DESC
            LIMIT 5
        `);

        // 5. Top 5 popular movies by tickets sold
        const [popularMovies] = await promiseDb.query(`
            SELECT 
                m.movie_id,
                m.title,
                m.genre,
                m.poster_url,
                COUNT(b.booking_id) AS total_bookings,
                COALESCE(SUM(b.seats), 0) AS tickets_sold,
                COALESCE(SUM(b.total_amount), 0) AS total_earnings
            FROM movies m
            LEFT JOIN shows s ON m.movie_id = s.movie_id
            LEFT JOIN bookings b ON s.show_id = b.show_id AND b.booking_status = 'CONFIRMED'
            GROUP BY m.movie_id
            ORDER BY tickets_sold DESC
            LIMIT 5
        `);

        return res.json({
            success: true,
            stats: {
                total_movies: movieCount[0].total,
                total_theatres: theatreCount[0].total,
                total_shows: showCount[0].total,
                total_customers: userCount[0].total,
                total_bookings: bookingCount[0].total,
                total_revenue: parseFloat(revenueResult[0].total_revenue),
                total_seats_sold: parseInt(seatsResult[0].total_seats_sold, 10),
                recent_bookings: recentBookings,
                popular_movies: popularMovies
            }
        });
    } catch (err) {
        console.error('Error fetching admin dashboard stats:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve admin dashboard stats.',
            error: err.message
        });
    }
};

module.exports = {
    getDashboardStats
};
