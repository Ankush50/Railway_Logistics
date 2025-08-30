const express = require('express');
const multer = require('multer');
const { uploadExcel } = require('../controllers/uploadController');
const { protect, authorize } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Uploads directory is created at server startup
const uploadsDir = path.join(__dirname, '../uploads');

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    // Add underscore separator between timestamp and filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    cb(null, `${timestamp}_${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: function(req, file, cb) {
    // Check file type
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.mimetype === 'application/vnd.ms-excel' ||
        file.originalname.endsWith('.xlsx') ||
        file.originalname.endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'), false);
    }
  },
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // Configurable file size limit, default 5MB
  }
});

// Admin route for Excel upload
router.use(protect, authorize('admin'));
router.post('/', upload.single('file'), uploadExcel);

module.exports = router;