const db = require('../config/db');
const promiseDb = db.promise();

// Get all movies with optional search and filters
const getAllMovies = async (req, res) => {
    try {
        const { search, genre, language, status } = req.query;
        let query = 'SELECT * FROM movies WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND (title LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (genre && genre !== 'all') {
            query += ' AND genre = ?';
            params.push(genre);
        }

        if (language && language !== 'all') {
            query += ' AND language = ?';
            params.push(language);
        }

        if (status && status !== 'all') {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY release_date DESC, movie_id DESC';

        const [movies] = await promiseDb.query(query, params);
        return res.json({
            success: true,
            count: movies.length,
            movies
        });
    } catch (err) {
        console.error('Error fetching movies:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve movies.',
            error: err.message
        });
    }
};

// Get single movie details by ID, including its shows and theatres
const getMovieById = async (req, res) => {
    try {
        const movieId = req.params.id;

        const [movies] = await promiseDb.query(
            'SELECT * FROM movies WHERE movie_id = ?',
            [movieId]
        );

        if (movies.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found.'
            });
        }

        const movie = movies[0];

        // Fetch upcoming/valid shows for this movie
        const showQuery = `
            SELECT 
                s.show_id, 
                s.movie_id, 
                s.theatre_id, 
                s.theatre_name, 
                s.show_date, 
                s.show_time, 
                s.ticket_price,
                t.location, 
                t.total_seats
            FROM shows s
            JOIN theatres t ON s.theatre_id = t.theatre_id
            WHERE s.movie_id = ?
            ORDER BY s.show_date ASC, s.show_time ASC
        `;
        const [shows] = await promiseDb.query(showQuery, [movieId]);

        return res.json({
            success: true,
            movie,
            shows
        });
    } catch (err) {
        console.error('Error fetching movie details:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve movie details.',
            error: err.message
        });
    }
};

// Add new movie (Admin)
const createMovie = async (req, res) => {
    try {
        const { title, genre, language, duration, release_date, description, poster_url, banner_url, rating, status } = req.body;

        if (!title || !genre || !language || !duration || !release_date) {
            return res.status(400).json({
                success: false,
                message: 'Title, genre, language, duration, and release date are required fields.'
            });
        }

        const fallbackPoster = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';
        const fallbackBanner = 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=80';

        const [result] = await promiseDb.query(
            `INSERT INTO movies 
            (title, genre, language, duration, release_date, description, poster_url, banner_url, rating, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title.trim(),
                genre.trim(),
                language.trim(),
                parseInt(duration, 10),
                release_date,
                description || 'Experience the cinema thrill on the big screen.',
                poster_url || fallbackPoster,
                banner_url || fallbackBanner,
                parseFloat(rating) || 8.0,
                status || 'now_showing'
            ]
        );

        return res.status(201).json({
            success: true,
            message: 'Movie added successfully!',
            movieId: result.insertId
        });
    } catch (err) {
        console.error('Error adding movie:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to add movie.',
            error: err.message
        });
    }
};

// Update movie (Admin)
const updateMovie = async (req, res) => {
    try {
        const movieId = req.params.id;
        const { title, genre, language, duration, release_date, description, poster_url, banner_url, rating, status } = req.body;

        const [existing] = await promiseDb.query('SELECT movie_id FROM movies WHERE movie_id = ?', [movieId]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found.'
            });
        }

        await promiseDb.query(
            `UPDATE movies SET 
                title = COALESCE(?, title),
                genre = COALESCE(?, genre),
                language = COALESCE(?, language),
                duration = COALESCE(?, duration),
                release_date = COALESCE(?, release_date),
                description = COALESCE(?, description),
                poster_url = COALESCE(?, poster_url),
                banner_url = COALESCE(?, banner_url),
                rating = COALESCE(?, rating),
                status = COALESCE(?, status)
            WHERE movie_id = ?`,
            [
                title,
                genre,
                language,
                duration ? parseInt(duration, 10) : null,
                release_date,
                description,
                poster_url,
                banner_url,
                rating ? parseFloat(rating) : null,
                status,
                movieId
            ]
        );

        return res.json({
            success: true,
            message: 'Movie updated successfully!'
        });
    } catch (err) {
        console.error('Error updating movie:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to update movie.',
            error: err.message
        });
    }
};

// Delete movie (Admin)
const deleteMovie = async (req, res) => {
    try {
        const movieId = req.params.id;

        const [result] = await promiseDb.query('DELETE FROM movies WHERE movie_id = ?', [movieId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found.'
            });
        }

        return res.json({
            success: true,
            message: 'Movie and associated shows deleted successfully.'
        });
    } catch (err) {
        console.error('Error deleting movie:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete movie.',
            error: err.message
        });
    }
};

module.exports = {
    getAllMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie
};
