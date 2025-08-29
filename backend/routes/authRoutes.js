const express = require('express');
const { register, login, getMe, logout, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegistration } = require('../middleware/validation');

const router = express.Router();

router.post('/register', validateRegistration, register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

module.exports = router;