const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  return !!(process.env.CLOUDINARY_CLOUD_NAME && 
            process.env.CLOUDINARY_API_KEY && 
            process.env.CLOUDINARY_API_SECRET);
};

// Configure Cloudinary only if credentials are available
if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('✅ Cloudinary configured successfully');
} else {
  console.log('⚠️  Cloudinary not configured - profile pictures will be stored locally');
}

// Configure Cloudinary storage for multer (only if configured)
let profilePictureStorage = null;

if (isCloudinaryConfigured()) {
  try {
    profilePictureStorage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'railway-logistics/profiles',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto:good' }
        ],
        public_id: (req, file) => {
          // Generate unique filename
          const timestamp = Date.now();
          const random = Math.round(Math.random() * 1E9);
          return `profile-${timestamp}-${random}`;
        }
      },
    });
  } catch (error) {
    console.error('Error creating Cloudinary storage:', error);
    profilePictureStorage = null;
  }
}

// Function to delete image from Cloudinary
const deleteImage = async (publicId) => {
  if (!isCloudinaryConfigured()) {
    console.log('Cloudinary not configured, skipping image deletion');
    return;
  }

  try {
    if (publicId && !publicId.startsWith('http')) {
      // If it's a local file path, don't try to delete from Cloudinary
      return;
    }
    
    // Extract public ID from URL if needed
    let cloudinaryPublicId = publicId;
    if (publicId && publicId.includes('cloudinary.com')) {
      const urlParts = publicId.split('/');
      const filename = urlParts[urlParts.length - 1].split('.')[0];
      cloudinaryPublicId = `railway-logistics/profiles/${filename}`;
    }
    
    const result = await cloudinary.uploader.destroy(cloudinaryPublicId);
    console.log('Image deleted from Cloudinary:', result);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Function to get optimized URL
const getOptimizedUrl = (publicId, options = {}) => {
  if (!publicId || !isCloudinaryConfigured()) return null;
  
  const defaultOptions = {
    width: 200,
    height: 200,
    crop: 'fill',
    gravity: 'face',
    quality: 'auto:good',
    format: 'auto'
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  return cloudinary.url(publicId, finalOptions);
};

module.exports = {
  cloudinary: isCloudinaryConfigured() ? cloudinary : null,
  profilePictureStorage,
  deleteImage,
  getOptimizedUrl,
  isCloudinaryConfigured
};
