const express = require('express');
const { createBooking, getUserBookings, getAllBookings, updateBookingStatus } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');
const { validateBooking } = require('../middleware/validation');

const router = express.Router();

router.use(protect);
router.post('/', validateBooking, createBooking);
router.get('/', getUserBookings);

// Admin routes
router.get('/all', authorize('admin'), getAllBookings);
router.put('/:id/status', authorize('admin'), updateBookingStatus);

module.exports = router;