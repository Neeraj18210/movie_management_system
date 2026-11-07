const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// Public auth routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.get('/profile', verifyToken, userController.getProfile);

// Admin-only customer listing
router.get('/customers', verifyToken, requireAdmin, userController.getAllCustomers);

module.exports = router;
