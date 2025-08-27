const express = require('express');
const { createBooking, getUserBookings } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.post('/', createBooking);
router.get('/', getUserBookings);

module.exports = router;