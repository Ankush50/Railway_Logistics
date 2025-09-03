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
const profileRoutes = require('./routes/profileRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// Trust proxy for rate limiting (important for production deployments)
app.set('trust proxy', 1);

// Apply security middleware conditionally based on environment
if (process.env.NODE_ENV === 'production') {
  app.use(securityMiddleware);
  app.use(securityLogger);
  app.use(blockSuspiciousUserAgents);
  app.use(validateOrigin);
  app.use(antiPhishingProtection);
  app.use(blockFileUploadAttacks);
} else {
  // Use only essential security in development
  console.log('Running in development mode with basic security');
}

// Security middleware - Configure Helmet with balanced security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://checkout.razorpay.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:", "https://api.razorpay.com", "https://*.razorpay.com"],
      fontSrc: ["'self'", "https:"],
      frameSrc: ["'self'", "https://api.razorpay.com", "https://*.razorpay.com", "https://checkout.razorpay.com"],
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
  exposedHeaders: ['Content-Type', 'Content-Length'],
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

// Create uploads directories once during startup
const fs = require('fs');

const createUploadDirectories = () => {
  try {
    const uploadsDir = path.join(__dirname, 'uploads');
    const profilesDir = path.join(uploadsDir, 'profiles');
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    if (!fs.existsSync(profilesDir)) {
      fs.mkdirSync(profilesDir, { recursive: true });
    }
    console.log('Upload directories created successfully');
    
    // Check if we need to create a placeholder file to prevent directory deletion
    const placeholderFile = path.join(profilesDir, '.keep');
    if (!fs.existsSync(placeholderFile)) {
      fs.writeFileSync(placeholderFile, 'This file prevents the profiles directory from being deleted during deployment');
      console.log('Placeholder file created in profiles directory');
    }
  } catch (error) {
    console.error('Error creating upload directories:', error);
  }
};

// Call this once during startup
createUploadDirectories();

// Check Cloudinary configuration
const checkCloudinaryConfig = () => {
  const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                        process.env.CLOUDINARY_API_KEY && 
                        process.env.CLOUDINARY_API_SECRET;
  
  if (hasCloudinary) {
    console.log('✅ Cloudinary configured - Profile pictures will be stored in the cloud');
  } else {
    console.log('⚠️  Cloudinary not configured - Profile pictures will be stored locally (may be lost on deployment)');
    console.log('   Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET for cloud storage');
  }
  
  return hasCloudinary;
};

checkCloudinaryConfig();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Configuration test endpoint
app.get('/api/config/test', (req, res) => {
  const config = {
    environment: process.env.NODE_ENV || 'development',
    cloudinary: {
      configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET),
      cloudName: process.env.CLOUDINARY_CLOUD_NAME ? '***' + process.env.CLOUDINARY_CLOUD_NAME.slice(-4) : null,
      hasApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasApiSecret: !!process.env.CLOUDINARY_API_SECRET
    },
    database: {
      connected: mongoose.connection.readyState === 1,
      readyState: mongoose.connection.readyState
    },
    uploads: {
      maxFileSize: process.env.MAX_FILE_SIZE || '5MB',
      directory: path.join(__dirname, 'uploads')
    }
  };
  
  res.status(200).json(config);
});

// Profile picture validation endpoint
app.get('/api/debug/profile-pictures', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const User = require('./models/User');
    
    const uploadsDir = path.join(__dirname, 'uploads');
    const profilesDir = path.join(uploadsDir, 'profiles');
    
    // Check directory status
    const uploadsExists = fs.existsSync(uploadsDir);
    const profilesExists = fs.existsSync(profilesDir);
    
    // List files in profiles directory
    let profileFiles = [];
    if (profilesExists) {
      profileFiles = fs.readdirSync(profilesDir);
    }
    
    // Get users with profile pictures
    const usersWithPictures = await User.find({ profilePicture: { $exists: true, $ne: null } })
      .select('_id name email profilePicture')
      .limit(10);
    
    // Check if profile picture files exist for users
    const profilePictureStatus = usersWithPictures.map(user => {
      let fileExists = false;
      let filePath = null;
      let storageType = 'unknown';
      
      if (user.profilePicture && user.profilePicture.includes('cloudinary.com')) {
        // Cloudinary URL
        fileExists = true;
        storageType = 'cloudinary';
        filePath = user.profilePicture;
      } else if (user.profilePicture) {
        // Local file
        filePath = path.join(profilesDir, user.profilePicture);
        fileExists = fs.existsSync(filePath);
        storageType = 'local';
      }
      
      return {
        userId: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        fileExists,
        path: filePath,
        storageType
      };
    });
    
    res.status(200).json({
      status: 'OK',
      directories: {
        uploads: uploadsExists,
        profiles: profilesExists,
        uploadsPath: uploadsDir,
        profilesPath: profilesDir
      },
      files: {
        total: profileFiles.length,
        list: profileFiles
      },
      users: {
        total: usersWithPictures.length,
        status: profilePictureStatus
      },
      cloudinary: {
        configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error.message
    });
  }
});

// Test endpoints removed for production optimization
// These endpoints were causing file operations during startup

// Test profile picture endpoint removed for production optimization

// Test image serving endpoint removed for production optimization

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
      '/api/config/test',
      '/api/debug/profile-pictures',
      '/api/auth/*',
      '/api/services/*',
      '/api/bookings/*',
      '/api/upload/*',
      '/api/profile/*',
      '/api/notifications/*',
      '/api/payments/*'
    ]
  });
});

// Error handling middleware
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));