const express = require('express');
const router = express.Router();
const showController = require('../controllers/showController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', showController.getAllShows);
router.get('/:id', showController.getShowById);
router.get('/:id/seats', showController.getSeatsByShow);

// Admin routes
router.post('/', verifyToken, requireAdmin, showController.createShow);
router.put('/:id', verifyToken, requireAdmin, showController.updateShow);
router.delete('/:id', verifyToken, requireAdmin, showController.deleteShow);

module.exports = router;
