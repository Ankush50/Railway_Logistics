const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed',
      errors: errors.array() 
    });
  }
  next();
};

// Sanitize and validate user registration
const validateRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-30 characters, alphanumeric and underscore only'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name must be 2-100 characters, letters and spaces only'),
  validate
];

// Sanitize and validate service creation
const validateService = [
  body('route')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Route must be 5-200 characters'),
  body('capacity')
    .isInt({ min: 1, max: 10000 })
    .withMessage('Capacity must be 1-10000 tons'),
  body('pricePerTon')
    .isInt({ min: 1, max: 100000 })
    .withMessage('Price must be 1-100000 per ton'),
  body('contact')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Contact must contain only numbers, +, -, spaces, and parentheses'),
  validate
];

// Sanitize and validate booking
const validateBooking = [
  body('serviceId')
    .isMongoId()
    .withMessage('Invalid service ID'),
  body('quantity')
    .isInt({ min: 1, max: 10000 })
    .withMessage('Quantity must be 1-10000 tons'),
  validate
];

module.exports = {
  validateRegistration,
  validateService,
  validateBooking,
  validate
};
