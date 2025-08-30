const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const ensureUploadsDir = () => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const profilesDir = path.join(uploadsDir, 'profiles');
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  if (!fs.existsSync(profilesDir)) {
    fs.mkdirSync(profilesDir, { recursive: true });
  }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res, next) => {
  try {
    console.log('Upload request received:', {
      file: req.file ? {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : 'No file',
      user: req.user ? req.user.id : 'No user'
    });

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Ensure uploads directory exists
    ensureUploadsDir();

    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('User before update:', {
      id: user._id,
      profilePicture: user.profilePicture
    });

    // Delete old profile picture if exists
    if (user.profilePicture) {
      const oldPicturePath = path.join(__dirname, '..', 'uploads', 'profiles', user.profilePicture);
      if (fs.existsSync(oldPicturePath)) {
        fs.unlinkSync(oldPicturePath);
        console.log('Deleted old profile picture:', oldPicturePath);
      }
    }

    // Save new profile picture filename
    user.profilePicture = req.file.filename;
    await user.save();

    console.log('User after update:', {
      id: user._id,
      profilePicture: user.profilePicture
    });

    console.log('Profile picture uploaded successfully:', req.file.filename);

    res.status(200).json({ 
      success: true, 
      data: { 
        profilePicture: req.file.filename,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
          phone: user.phone,
          address: user.address,
          profilePicture: user.profilePicture
        }
      },
      message: 'Profile picture updated successfully' 
    });
  } catch (err) {
    console.error('Upload error:', err);
    next(err);
  }
};

// Get profile picture
exports.getProfilePicture = async (req, res, next) => {
  try {
    // If userId is provided in params, use it; otherwise use authenticated user's ID
    const userId = req.params.userId || (req.user ? req.user.id : null);
    
    console.log('Profile picture request:', {
      userId: userId,
      params: req.params,
      hasUser: !!req.user,
      userAgent: req.headers['user-agent'],
      cacheControl: req.headers['cache-control']
    });
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    
    const user = await User.findById(userId).select('profilePicture');
    
    console.log('User found:', {
      userId: userId,
      hasProfilePicture: !!user?.profilePicture,
      profilePicture: user?.profilePicture
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.profilePicture) {
      return res.status(404).json({ success: false, message: 'No profile picture found' });
    }

    const picturePath = path.join(__dirname, '..', 'uploads', 'profiles', user.profilePicture);
    
    console.log('Picture path:', picturePath);
    console.log('File exists:', fs.existsSync(picturePath));
    
    if (!fs.existsSync(picturePath)) {
      console.error('Profile picture file not found:', picturePath);
      return res.status(404).json({ success: false, message: 'Profile picture file not found' });
    }

    // Get file stats for better caching
    const stats = fs.statSync(picturePath);
    const etag = `"${stats.size}-${stats.mtime.getTime()}"`;
    
    // Check if client has cached version
    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }

    // Set proper headers for image serving with aggressive cache busting
    res.set({
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'no-cache, no-store, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Content-Type-Options': 'nosniff',
      'ETag': etag,
      'Last-Modified': stats.mtime.toUTCString()
    });

    console.log('Sending file:', picturePath);
    res.sendFile(picturePath);
  } catch (err) {
    console.error('Error serving profile picture:', err);
    next(err);
  }
};

// Delete profile picture
exports.deleteProfilePicture = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.profilePicture) {
      return res.status(400).json({ success: false, message: 'No profile picture to delete' });
    }

    // Delete file from filesystem
    const picturePath = path.join(__dirname, '..', 'uploads', 'profiles', user.profilePicture);
    if (fs.existsSync(picturePath)) {
      fs.unlinkSync(picturePath);
    }

    // Remove from database
    user.profilePicture = null;
    await user.save();

    res.status(200).json({ 
      success: true, 
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
          phone: user.phone,
          address: user.address,
          profilePicture: user.profilePicture
        }
      },
      message: 'Profile picture deleted successfully' 
    });
  } catch (err) {
    next(err);
  }
};
