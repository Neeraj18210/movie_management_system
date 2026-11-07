const db = require('../config/db');

// Create new booking with MySQL Transaction to prevent double booking
const createBooking = async (req, res) => {
    let connection;
    try {
        const userId = req.user.user_id;
        const { show_id, seats } = req.body;

        if (!show_id || !seats || !Array.isArray(seats) || seats.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid show_id and select at least one seat.'
            });
        }

        // Clean seat labels
        const requestedSeats = seats.map(s => String(s).trim().toUpperCase());

        // Get dedicated connection for transaction
        connection = await db.promise().getConnection();
        await connection.beginTransaction();

        // 1. Fetch show and ticket price
        const [showRows] = await connection.query(
            `SELECT s.show_id, s.ticket_price, s.show_date, s.show_time, s.theatre_name, m.title AS movie_title 
             FROM shows s
             JOIN movies m ON s.movie_id = m.movie_id
             WHERE s.show_id = ? FOR UPDATE`,
            [show_id]
        );

        if (showRows.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({
                success: false,
                message: 'Show not found.'
            });
        }

        const show = showRows[0];
        const ticketPrice = parseFloat(show.ticket_price);
        const totalAmount = parseFloat((ticketPrice * requestedSeats.length).toFixed(2));

        // 2. Concurrency Check: Check if any requested seat is already booked for this show
        const [conflictRows] = await connection.query(
            `SELECT bs.seat_number 
             FROM booking_seats bs
             JOIN bookings b ON bs.booking_id = b.booking_id
             WHERE bs.show_id = ? 
               AND bs.seat_number IN (?) 
               AND b.booking_status = 'CONFIRMED'
             FOR UPDATE`,
            [show_id, requestedSeats]
        );

        if (conflictRows.length > 0) {
            const bookedSeatsList = conflictRows.map(r => r.seat_number).join(', ');
            await connection.rollback();
            connection.release();
            return res.status(409).json({
                success: false,
                message: `Seat(s) ${bookedSeatsList} have already been reserved by another customer. Please select different seats.`
            });
        }

        // 3. Generate unique booking reference
        const timestamp = Date.now().toString().slice(-6);
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const bookingReference = `MTMS-${timestamp}-${randomNum}`;

        // 4. Insert into bookings
        const [bookingResult] = await connection.query(
            `INSERT INTO bookings (booking_reference, user_id, show_id, seats, total_amount, booking_status) 
             VALUES (?, ?, ?, ?, ?, 'CONFIRMED')`,
            [bookingReference, userId, show_id, requestedSeats.length, totalAmount]
        );

        const newBookingId = bookingResult.insertId;

        // 5. Insert each seat into booking_seats
        const seatInsertPromises = requestedSeats.map(seatNumber => {
            return connection.query(
                `INSERT INTO booking_seats (booking_id, show_id, seat_number) VALUES (?, ?, ?)`,
                [newBookingId, show_id, seatNumber]
            );
        });

        await Promise.all(seatInsertPromises);

        // Commit transaction
        await connection.commit();
        connection.release();

        return res.status(201).json({
            success: true,
            message: 'Booking confirmed successfully!',
            booking: {
                booking_id: newBookingId,
                booking_reference: bookingReference,
                movie_title: show.movie_title,
                theatre_name: show.theatre_name,
                show_date: show.show_date,
                show_time: show.show_time,
                seats: requestedSeats,
                seat_count: requestedSeats.length,
                ticket_price: ticketPrice,
                total_amount: totalAmount,
                status: 'CONFIRMED'
            }
        });
    } catch (err) {
        if (connection) {
            try {
                await connection.rollback();
                connection.release();
            } catch (rbErr) {
                console.error('Rollback error:', rbErr);
            }
        }
        console.error('Booking confirmation error:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error while processing booking transaction.',
            error: err.message
        });
    }
};

// Get current user's bookings (My Bookings)
const getMyBookings = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const query = `
            SELECT 
                b.booking_id,
                b.booking_reference,
                b.seats AS seat_count,
                b.total_amount,
                b.booking_status,
                b.created_at AS booking_date,
                s.show_id,
                s.show_date,
                s.show_time,
                s.ticket_price,
                s.theatre_name,
                t.location AS theatre_location,
                m.movie_id,
                m.title AS movie_title,
                m.genre,
                m.language,
                m.duration,
                m.poster_url,
                (
                    SELECT GROUP_CONCAT(bs.seat_number ORDER BY bs.seat_number ASC SEPARATOR ', ')
                    FROM booking_seats bs
                    WHERE bs.booking_id = b.booking_id
                ) AS seat_numbers
            FROM bookings b
            JOIN shows s ON b.show_id = s.show_id
            JOIN movies m ON s.movie_id = m.movie_id
            JOIN theatres t ON s.theatre_id = t.theatre_id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
        `;
        const [bookings] = await db.promise().query(query, [userId]);

        return res.json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (err) {
        console.error('Error fetching user bookings:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve your bookings.',
            error: err.message
        });
    }
};

// Get single booking by ID or reference
const getBookingById = async (req, res) => {
    try {
        const idOrRef = req.params.id;
        const userId = req.user.user_id;
        const isAdmin = req.user.role === 'admin';

        let query = `
            SELECT 
                b.booking_id,
                b.booking_reference,
                b.seats AS seat_count,
                b.total_amount,
                b.booking_status,
                b.created_at AS booking_date,
                u.name AS customer_name,
                u.email AS customer_email,
                u.phone AS customer_phone,
                s.show_id,
                s.show_date,
                s.show_time,
                s.ticket_price,
                s.theatre_name,
                t.location AS theatre_location,
                m.movie_id,
                m.title AS movie_title,
                m.genre,
                m.language,
                m.duration,
                m.poster_url,
                (
                    SELECT GROUP_CONCAT(bs.seat_number ORDER BY bs.seat_number ASC SEPARATOR ', ')
                    FROM booking_seats bs
                    WHERE bs.booking_id = b.booking_id
                ) AS seat_numbers
            FROM bookings b
            JOIN users u ON b.user_id = u.user_id
            JOIN shows s ON b.show_id = s.show_id
            JOIN movies m ON s.movie_id = m.movie_id
            JOIN theatres t ON s.theatre_id = t.theatre_id
            WHERE (b.booking_id = ? OR b.booking_reference = ?)
        `;
        const params = [idOrRef, idOrRef];

        if (!isAdmin) {
            query += ' AND b.user_id = ?';
            params.push(userId);
        }

        const [bookings] = await db.promise().query(query, params);

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found.'
            });
        }

        return res.json({
            success: true,
            booking: bookings[0]
        });
    } catch (err) {
        console.error('Error fetching booking details:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve booking details.',
            error: err.message
        });
    }
};

// Cancel booking (frees up reserved seats)
const cancelBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user.user_id;
        const isAdmin = req.user.role === 'admin';

        // Find booking
        let findQuery = 'SELECT * FROM bookings WHERE booking_id = ?';
        const params = [bookingId];

        if (!isAdmin) {
            findQuery += ' AND user_id = ?';
            params.push(userId);
        }

        const [bookings] = await db.promise().query(findQuery, params);

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found or you do not have permission to cancel it.'
            });
        }

        const booking = bookings[0];

        if (booking.booking_status === 'CANCELLED') {
            return res.status(400).json({
                success: false,
                message: 'This booking is already cancelled.'
            });
        }

        // Update status to CANCELLED
        await db.promise().query(
            'UPDATE bookings SET booking_status = ? WHERE booking_id = ?',
            ['CANCELLED', bookingId]
        );

        return res.json({
            success: true,
            message: 'Booking cancelled successfully. Reserved seats have been released.'
        });
    } catch (err) {
        console.error('Error cancelling booking:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to cancel booking.',
            error: err.message
        });
    }
};

// Get all bookings (Admin only)
const getAllBookings = async (req, res) => {
    try {
        const { status, search } = req.query;

        let query = `
            SELECT 
                b.booking_id,
                b.booking_reference,
                b.seats AS seat_count,
                b.total_amount,
                b.booking_status,
                b.created_at AS booking_date,
                u.user_id,
                u.name AS customer_name,
                u.email AS customer_email,
                u.phone AS customer_phone,
                s.show_id,
                s.show_date,
                s.show_time,
                s.theatre_name,
                m.title AS movie_title,
                (
                    SELECT GROUP_CONCAT(bs.seat_number ORDER BY bs.seat_number ASC SEPARATOR ', ')
                    FROM booking_seats bs
                    WHERE bs.booking_id = b.booking_id
                ) AS seat_numbers
            FROM bookings b
            JOIN users u ON b.user_id = u.user_id
            JOIN shows s ON b.show_id = s.show_id
            JOIN movies m ON s.movie_id = m.movie_id
            WHERE 1=1
        `;
        const params = [];

        if (status && status !== 'all') {
            query += ' AND b.booking_status = ?';
            params.push(status);
        }

        if (search) {
            query += ' AND (b.booking_reference LIKE ? OR u.name LIKE ? OR u.email LIKE ? OR m.title LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY b.created_at DESC';

        const [bookings] = await db.promise().query(query, params);

        return res.json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (err) {
        console.error('Error fetching all bookings for admin:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings list.',
            error: err.message
        });
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking,
    getAllBookings
};
