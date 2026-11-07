const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', movieController.getAllMovies);
router.get('/:id', movieController.getMovieById);

// Admin routes
router.post('/', verifyToken, requireAdmin, movieController.createMovie);
router.put('/:id', verifyToken, requireAdmin, movieController.updateMovie);
router.delete('/:id', verifyToken, requireAdmin, movieController.deleteMovie);

module.exports = router;
