const express = require('express');
const router = express.Router();
const theatreController = require('../controllers/theatreController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', theatreController.getAllTheatres);
router.get('/:id', theatreController.getTheatreById);

// Admin routes
router.post('/', verifyToken, requireAdmin, theatreController.createTheatre);
router.put('/:id', verifyToken, requireAdmin, theatreController.updateTheatre);
router.delete('/:id', verifyToken, requireAdmin, theatreController.deleteTheatre);

module.exports = router;
