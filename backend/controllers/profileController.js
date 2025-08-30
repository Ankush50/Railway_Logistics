const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const { deleteImage, getOptimizedUrl, isCloudinaryConfigured } = require('../config/cloudinary');

// Upload directories are created at server startup
// No need to check/create them here

// Upload profile picture
exports.uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Upload directories are already created at startup

    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete old profile picture if exists
    if (user.profilePicture) {
      try {
        // Try to delete from Cloudinary if it's a cloud URL
        if (user.profilePicture.includes('cloudinary.com')) {
          await deleteImage(user.profilePicture);
        } else {
          // Delete local file if it exists
          const oldPicturePath = path.join(__dirname, '..', 'uploads', 'profiles', user.profilePicture);
          if (fs.existsSync(oldPicturePath)) {
            fs.unlinkSync(oldPicturePath);
          }
        }
      } catch (deleteError) {
        console.warn('Could not delete old profile picture:', deleteError.message);
        // Continue with the process even if deletion fails
      }
    }

    // Save new profile picture URL or filename
    const storageType = isCloudinaryConfigured() ? 'cloudinary' : 'local';
    let profilePictureData;
    
    if (storageType === 'cloudinary') {
      // Cloudinary storage - save the URL
      profilePictureData = req.file.path;
    } else {
      // Local storage - save the filename
      profilePictureData = req.file.filename;
    }
    
    user.profilePicture = profilePictureData;
    await user.save();

    res.status(200).json({ 
      success: true, 
      data: { 
        profilePicture: profilePictureData,
        profilePictureUrl: storageType === 'cloudinary' ? profilePictureData : `/uploads/profiles/${profilePictureData}`,
        storageType,
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
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    
    const user = await User.findById(userId).select('profilePicture');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.profilePicture) {
      return res.status(404).json({ success: false, message: 'No profile picture found' });
    }

    // If it's a Cloudinary URL, redirect to it
    if (user.profilePicture && user.profilePicture.includes('cloudinary.com')) {
      try {
        // Get optimized URL with proper dimensions
        const optimizedUrl = getOptimizedUrl(user.profilePicture, {
          width: 400,
          height: 400,
          crop: 'fill',
          gravity: 'face'
        });
        
        return res.redirect(optimizedUrl);
      } catch (cloudinaryError) {
        console.error('Error generating Cloudinary URL:', cloudinaryError);
        // Fall back to the original URL if optimization fails
        return res.redirect(user.profilePicture);
      }
    }

    // Fallback to local file serving (for backward compatibility)
    if (!user.profilePicture || user.profilePicture.includes('cloudinary.com')) {
      return res.status(404).json({ 
        success: false, 
        message: 'Profile picture not accessible',
        suggestion: 'Please upload a new profile picture'
      });
    }

    const picturePath = path.join(__dirname, '..', 'uploads', 'profiles', user.profilePicture);
    
    if (!fs.existsSync(picturePath)) {
      console.error('Profile picture file not found:', picturePath);
      
      // If file doesn't exist, clear the profile picture from database
      try {
        user.profilePicture = null;
        await user.save();
        console.log(`Cleared missing profile picture for user ${userId}`);
      } catch (clearError) {
        console.error('Error clearing missing profile picture:', clearError);
      }
      
      return res.status(404).json({ 
        success: false, 
        message: 'Profile picture file not found - it may have been lost during deployment',
        filename: user.profilePicture,
        path: picturePath,
        suggestion: 'Please upload a new profile picture'
      });
    }

    // Get file stats for better caching
    const stats = fs.statSync(picturePath);
    const etag = `"${stats.size}-${stats.mtime.getTime()}"`;
    
    // Check if client has cached version
    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }

    // Set proper headers for image serving with better caching
    res.set({
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      'ETag': etag,
      'Last-Modified': stats.mtime.toUTCString(),
      'X-Content-Type-Options': 'nosniff'
    });

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

    // Delete file from Cloudinary or local filesystem
    try {
      if (user.profilePicture.includes('cloudinary.com')) {
        await deleteImage(user.profilePicture);
      } else {
        // Delete local file if it exists
        const picturePath = path.join(__dirname, '..', 'uploads', 'profiles', user.profilePicture);
        if (fs.existsSync(picturePath)) {
          fs.unlinkSync(picturePath);
        }
      }
    } catch (deleteError) {
      console.warn('Could not delete profile picture file:', deleteError.message);
      // Continue with the process even if file deletion fails
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
