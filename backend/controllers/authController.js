const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register a new user
exports.register = async (req, res, next) => {
  try {
    const { username, password, email, name, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }

    // Create user
    const user = await User.create({ username, password, email, name, role });

    // Generate token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });

    res.status(201).json({ success: true, token, user });
  } catch (err) {
    next(err);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });

    res.status(200).json({ success: true, token, user });
  } catch (err) {
    next(err);
  }
};

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};