const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// Get overall stats for Admin Dashboard
router.get('/stats', verifyToken, requireAdmin, adminController.getDashboardStats);

module.exports = router;
