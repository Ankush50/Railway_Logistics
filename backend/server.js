require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const { 
  securityMiddleware, 
  securityLogger, 
  blockSuspiciousUserAgents, 
  validateOrigin,
  antiPhishingProtection,
  blockFileUploadAttacks
} = require('./middleware/security');

const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// Trust proxy for rate limiting (important for production deployments)
app.set('trust proxy', 1);

// Apply security middleware first
app.use(securityMiddleware);
app.use(securityLogger);
app.use(blockSuspiciousUserAgents);
app.use(validateOrigin);
app.use(antiPhishingProtection);
app.use(blockFileUploadAttacks);

// Security middleware - Configure Helmet with balanced security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
      fontSrc: ["'self'", "https:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true
}));

// Rate limiting - Balanced for security and usability
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased from 50 for better usability
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  keyGenerator: (req) => {
    // Use X-Forwarded-For if available, fallback to req.ip
    return req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Increased from 5 for better usability
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  keyGenerator: (req) => {
    // Use X-Forwarded-For if available, fallback to req.ip
    return req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
  }
});

// Apply rate limiting
app.use('/api/', strictLimiter);
app.use('/api/auth', authLimiter);

// CORS configuration - Balanced for security and functionality
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://turbotransit1.netlify.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
}));

// Parse cookies for httpOnly auth
app.use(cookieParser());

// Body parsing with balanced limits
app.use(express.json({ 
  limit: '5mb', // Increased from 1MB for better usability
  strict: true,
  type: 'application/json'
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '5mb',
  parameterLimit: 20 // Increased from 10
}));

// Static file serving with security
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
  }
}));

// Database connection with security
process.env.JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/railway_logistics';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler - More informative
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.url,
    method: req.method,
    availableRoutes: [
      '/health',
      '/api/auth/*',
      '/api/services/*',
      '/api/bookings/*',
      '/api/upload/*'
    ]
  });
});

// Error handling middleware
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));