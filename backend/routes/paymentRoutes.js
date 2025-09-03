const express = require('express');
const rateLimit = require('express-rate-limit');
const { protect } = require('../middleware/auth');
const { createOrder, verifyPayment, receipt, webhook } = require('../controllers/paymentController');

const router = express.Router();

// Tighter rate limit for payment endpoints
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false
});

router.use(paymentLimiter);

router.post('/order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/receipt/:id', protect, receipt);

// Optional webhook (do not require auth, but signature-verified inside)
router.post('/webhook', express.json({ type: 'application/json' }), webhook);

module.exports = router;


