const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// Customer & Admin booking routes
router.post('/', verifyToken, bookingController.createBooking);
router.get('/my-bookings', verifyToken, bookingController.getMyBookings);
router.get('/:id', verifyToken, bookingController.getBookingById);
router.put('/:id/cancel', verifyToken, bookingController.cancelBooking);

// Admin-only: list all bookings
router.get('/', verifyToken, requireAdmin, bookingController.getAllBookings);

module.exports = router;
