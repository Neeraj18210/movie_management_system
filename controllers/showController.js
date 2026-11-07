const db = require('../config/db');
const promiseDb = db.promise();

// Get all shows with filters
const getAllShows = async (req, res) => {
    try {
        const { movie_id, theatre_id, date, upcoming_only } = req.query;

        let query = `
            SELECT 
                s.show_id,
                s.movie_id,
                s.theatre_id,
                s.theatre_name,
                s.show_date,
                s.show_time,
                s.ticket_price,
                s.created_at,
                m.title AS movie_title,
                m.genre,
                m.language,
                m.duration,
                m.poster_url,
                t.location AS theatre_location,
                t.total_seats,
                (
                    SELECT COUNT(bs.booking_seat_id)
                    FROM booking_seats bs
                    JOIN bookings b ON bs.booking_id = b.booking_id
                    WHERE bs.show_id = s.show_id AND b.booking_status = 'CONFIRMED'
                ) AS booked_seats_count
            FROM shows s
            JOIN movies m ON s.movie_id = m.movie_id
            JOIN theatres t ON s.theatre_id = t.theatre_id
            WHERE 1=1
        `;
        const params = [];

        if (movie_id) {
            query += ' AND s.movie_id = ?';
            params.push(movie_id);
        }

        if (theatre_id) {
            query += ' AND s.theatre_id = ?';
            params.push(theatre_id);
        }

        if (date) {
            query += ' AND s.show_date = ?';
            params.push(date);
        }

        if (upcoming_only === 'true' || upcoming_only === '1') {
            query += ' AND (s.show_date > CURDATE() OR (s.show_date = CURDATE() AND s.show_time >= CURTIME()))';
        }

        query += ' ORDER BY s.show_date ASC, s.show_time ASC';

        const [shows] = await promiseDb.query(query, params);

        // Add calculated available_seats
        const formattedShows = shows.map(show => ({
            ...show,
            available_seats: Math.max(0, (show.total_seats || 60) - show.booked_seats_count)
        }));

        return res.json({
            success: true,
            count: formattedShows.length,
            shows: formattedShows
        });
    } catch (err) {
        console.error('Error fetching shows:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve shows.',
            error: err.message
        });
    }
};

// Get single show by ID with movie and theatre info
const getShowById = async (req, res) => {
    try {
        const showId = req.params.id;

        const query = `
            SELECT 
                s.show_id,
                s.movie_id,
                s.theatre_id,
                s.theatre_name,
                s.show_date,
                s.show_time,
                s.ticket_price,
                m.title AS movie_title,
                m.genre,
                m.language,
                m.duration,
                m.poster_url,
                m.banner_url,
                t.location AS theatre_location,
                t.total_seats
            FROM shows s
            JOIN movies m ON s.movie_id = m.movie_id
            JOIN theatres t ON s.theatre_id = t.theatre_id
            WHERE s.show_id = ?
        `;
        const [shows] = await promiseDb.query(query, [showId]);

        if (shows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Show not found.'
            });
        }

        const show = shows[0];

        // Fetch booked seats for this show
        const [bookedSeatRows] = await promiseDb.query(`
            SELECT bs.seat_number 
            FROM booking_seats bs
            JOIN bookings b ON bs.booking_id = b.booking_id
            WHERE bs.show_id = ? AND b.booking_status = 'CONFIRMED'
        `, [showId]);

        const bookedSeats = bookedSeatRows.map(r => r.seat_number);

        return res.json({
            success: true,
            show: {
                ...show,
                booked_seats: bookedSeats,
                total_seats: show.total_seats || 60,
                available_seats: Math.max(0, (show.total_seats || 60) - bookedSeats.length)
            }
        });
    } catch (err) {
        console.error('Error fetching show details:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve show details.',
            error: err.message
        });
    }
};

// Get booked seats for a specific show
const getSeatsByShow = async (req, res) => {
    try {
        const showId = req.params.id;

        const [shows] = await promiseDb.query('SELECT show_id, ticket_price FROM shows WHERE show_id = ?', [showId]);
        if (shows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Show not found.'
            });
        }

        const [rows] = await promiseDb.query(`
            SELECT bs.seat_number 
            FROM booking_seats bs
            JOIN bookings b ON bs.booking_id = b.booking_id
            WHERE bs.show_id = ? AND b.booking_status = 'CONFIRMED'
        `, [showId]);

        const bookedSeats = rows.map(r => r.seat_number);

        return res.json({
            success: true,
            show_id: parseInt(showId, 10),
            ticket_price: parseFloat(shows[0].ticket_price),
            booked_seats: bookedSeats
        });
    } catch (err) {
        console.error('Error fetching booked seats:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve booked seats.',
            error: err.message
        });
    }
};

// Create new show (Admin)
const createShow = async (req, res) => {
    try {
        const { movie_id, theatre_id, show_date, show_time, ticket_price } = req.body;

        if (!movie_id || !theatre_id || !show_date || !show_time || !ticket_price) {
            return res.status(400).json({
                success: false,
                message: 'Movie, theatre, date, time, and ticket price are all required.'
            });
        }

        // Fetch theatre name
        const [theatres] = await promiseDb.query('SELECT theatre_name FROM theatres WHERE theatre_id = ?', [theatre_id]);
        if (theatres.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Selected theatre does not exist.'
            });
        }
        const theatreName = theatres[0].theatre_name;

        // Verify movie exists
        const [movies] = await promiseDb.query('SELECT title FROM movies WHERE movie_id = ?', [movie_id]);
        if (movies.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Selected movie does not exist.'
            });
        }

        const [result] = await promiseDb.query(
            `INSERT INTO shows (movie_id, theatre_id, theatre_name, show_date, show_time, ticket_price) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [movie_id, theatre_id, theatreName, show_date, show_time, parseFloat(ticket_price)]
        );

        return res.status(201).json({
            success: true,
            message: 'Show scheduled successfully!',
            showId: result.insertId
        });
    } catch (err) {
        console.error('Error scheduling show:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to schedule show.',
            error: err.message
        });
    }
};

// Update show (Admin)
const updateShow = async (req, res) => {
    try {
        const showId = req.params.id;
        const { movie_id, theatre_id, show_date, show_time, ticket_price } = req.body;

        const [existing] = await promiseDb.query('SELECT * FROM shows WHERE show_id = ?', [showId]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Show not found.'
            });
        }

        let theatreName = existing[0].theatre_name;
        if (theatre_id && theatre_id !== existing[0].theatre_id) {
            const [t] = await promiseDb.query('SELECT theatre_name FROM theatres WHERE theatre_id = ?', [theatre_id]);
            if (t.length > 0) {
                theatreName = t[0].theatre_name;
            }
        }

        await promiseDb.query(
            `UPDATE shows SET 
                movie_id = COALESCE(?, movie_id),
                theatre_id = COALESCE(?, theatre_id),
                theatre_name = COALESCE(?, theatre_name),
                show_date = COALESCE(?, show_date),
                show_time = COALESCE(?, show_time),
                ticket_price = COALESCE(?, ticket_price)
            WHERE show_id = ?`,
            [
                movie_id || null,
                theatre_id || null,
                theatreName,
                show_date || null,
                show_time || null,
                ticket_price ? parseFloat(ticket_price) : null,
                showId
            ]
        );

        return res.json({
            success: true,
            message: 'Show updated successfully!'
        });
    } catch (err) {
        console.error('Error updating show:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to update show.',
            error: err.message
        });
    }
};

// Delete show (Admin)
const deleteShow = async (req, res) => {
    try {
        const showId = req.params.id;

        const [result] = await promiseDb.query('DELETE FROM shows WHERE show_id = ?', [showId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Show not found.'
            });
        }

        return res.json({
            success: true,
            message: 'Show and associated bookings deleted successfully.'
        });
    } catch (err) {
        console.error('Error deleting show:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete show.',
            error: err.message
        });
    }
};

module.exports = {
    getAllShows,
    getShowById,
    getSeatsByShow,
    createShow,
    updateShow,
    deleteShow
};
