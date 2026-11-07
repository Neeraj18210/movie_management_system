const db = require('../config/db');
const promiseDb = db.promise();

// Get all theatres
const getAllTheatres = async (req, res) => {
    try {
        const query = `
            SELECT 
                t.theatre_id, 
                t.theatre_name, 
                t.location, 
                t.total_seats, 
                t.created_at,
                COUNT(s.show_id) AS active_shows_count
            FROM theatres t
            LEFT JOIN shows s ON t.theatre_id = s.theatre_id
            GROUP BY t.theatre_id
            ORDER BY t.theatre_name ASC
        `;
        const [theatres] = await promiseDb.query(query);

        return res.json({
            success: true,
            count: theatres.length,
            theatres
        });
    } catch (err) {
        console.error('Error fetching theatres:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve theatres.',
            error: err.message
        });
    }
};

// Get single theatre by ID
const getTheatreById = async (req, res) => {
    try {
        const theatreId = req.params.id;

        const [theatres] = await promiseDb.query(
            'SELECT * FROM theatres WHERE theatre_id = ?',
            [theatreId]
        );

        if (theatres.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Theatre not found.'
            });
        }

        const theatre = theatres[0];

        // Fetch shows at this theatre
        const showQuery = `
            SELECT 
                s.show_id, 
                s.show_date, 
                s.show_time, 
                s.ticket_price,
                m.movie_id, 
                m.title, 
                m.genre, 
                m.duration, 
                m.poster_url, 
                m.language
            FROM shows s
            JOIN movies m ON s.movie_id = m.movie_id
            WHERE s.theatre_id = ?
            ORDER BY s.show_date ASC, s.show_time ASC
        `;
        const [shows] = await promiseDb.query(showQuery, [theatreId]);

        return res.json({
            success: true,
            theatre,
            shows
        });
    } catch (err) {
        console.error('Error fetching theatre details:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve theatre details.',
            error: err.message
        });
    }
};

// Add new theatre (Admin)
const createTheatre = async (req, res) => {
    try {
        const { theatre_name, location, total_seats } = req.body;

        if (!theatre_name || !location) {
            return res.status(400).json({
                success: false,
                message: 'Theatre name and location are required.'
            });
        }

        const seats = total_seats ? parseInt(total_seats, 10) : 60;

        const [result] = await promiseDb.query(
            'INSERT INTO theatres (theatre_name, location, total_seats) VALUES (?, ?, ?)',
            [theatre_name.trim(), location.trim(), seats]
        );

        return res.status(201).json({
            success: true,
            message: 'Theatre created successfully!',
            theatreId: result.insertId
        });
    } catch (err) {
        console.error('Error creating theatre:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to create theatre.',
            error: err.message
        });
    }
};

// Update theatre (Admin)
const updateTheatre = async (req, res) => {
    try {
        const theatreId = req.params.id;
        const { theatre_name, location, total_seats } = req.body;

        const [existing] = await promiseDb.query('SELECT theatre_id FROM theatres WHERE theatre_id = ?', [theatreId]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Theatre not found.'
            });
        }

        await promiseDb.query(
            `UPDATE theatres SET 
                theatre_name = COALESCE(?, theatre_name),
                location = COALESCE(?, location),
                total_seats = COALESCE(?, total_seats)
            WHERE theatre_id = ?`,
            [
                theatre_name ? theatre_name.trim() : null,
                location ? location.trim() : null,
                total_seats ? parseInt(total_seats, 10) : null,
                theatreId
            ]
        );

        // Also sync theatre_name in shows if changed
        if (theatre_name) {
            await promiseDb.query('UPDATE shows SET theatre_name = ? WHERE theatre_id = ?', [theatre_name.trim(), theatreId]);
        }

        return res.json({
            success: true,
            message: 'Theatre updated successfully!'
        });
    } catch (err) {
        console.error('Error updating theatre:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to update theatre.',
            error: err.message
        });
    }
};

// Delete theatre (Admin)
const deleteTheatre = async (req, res) => {
    try {
        const theatreId = req.params.id;

        const [result] = await promiseDb.query('DELETE FROM theatres WHERE theatre_id = ?', [theatreId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Theatre not found.'
            });
        }

        return res.json({
            success: true,
            message: 'Theatre and scheduled shows deleted successfully.'
        });
    } catch (err) {
        console.error('Error deleting theatre:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete theatre.',
            error: err.message
        });
    }
};

module.exports = {
    getAllTheatres,
    getTheatreById,
    createTheatre,
    updateTheatre,
    deleteTheatre
};
