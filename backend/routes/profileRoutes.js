const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const { 
  uploadProfilePicture, 
  getProfilePicture, 
  deleteProfilePicture 
} = require('../controllers/profileController');

// Import Cloudinary storage
const { profilePictureStorage, isCloudinaryConfigured } = require('../config/cloudinary');

// Configure multer for profile picture uploads
let upload;

if (profilePictureStorage) {
  // Use Cloudinary storage if configured
  upload = multer({ 
    storage: profilePictureStorage,
    fileFilter: (req, file, cb) => {
      // Accept only image files
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    },
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // Configurable file size limit, default 5MB
    }
  }).single('profilePicture');
} else {
  // Fallback to local storage
  const localStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = 'uploads/profiles/';
      // Directory is created at startup, no need to check/create here
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  upload = multer({ 
    storage: localStorage,
    fileFilter: (req, file, cb) => {
      // Accept only image files
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    },
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // Configurable file size limit, default 5MB
    }
  }).single('profilePicture');
}

// Error handling middleware for multer
const handleUpload = (req, res, next) => {
  console.log('Upload middleware - Request received:', {
    method: req.method,
    url: req.url,
    hasFile: !!req.file,
    storageType: isCloudinaryConfigured() ? 'cloudinary' : 'local',
    headers: req.headers
  });
  
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          success: false, 
          message: 'File size too large. Maximum size is 5MB.' 
        });
      }
      return res.status(400).json({ 
        success: false, 
        message: 'File upload error: ' + err.message 
      });
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ 
        success: false, 
        message: 'File upload error: ' + err.message 
      });
    }
    
    console.log('Upload middleware - File processed:', {
      hasFile: !!req.file,
      filename: req.file?.filename,
      originalname: req.file?.originalname,
      mimetype: req.file?.mimetype,
      size: req.file?.size,
      url: req.file?.path, // Cloudinary URL or local path
      storageType: isCloudinaryConfigured() ? 'cloudinary' : 'local'
    });
    
    next();
  });
};

// Routes
router.post('/upload-picture', protect, handleUpload, uploadProfilePicture);
router.get('/picture/:userId?', getProfilePicture); // Remove protect for public access to profile pictures
router.delete('/picture', protect, deleteProfilePicture);

module.exports = router;
