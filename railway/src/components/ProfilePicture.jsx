import React, { useState, useRef, useEffect } from 'react';
import { User, Camera, X, Loader2, Upload } from 'lucide-react';
import { uploadProfilePicture, deleteProfilePicture, getProfilePictureUrl } from '../api';
import ImageCropper from './ImageCropper';

const ProfilePicture = ({ user, isDark = false, onUpdate, size = 'md', showUploadButton = false }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [lastProfilePicture, setLastProfilePicture] = useState(user?.profilePicture);
  const [retryCount, setRetryCount] = useState(0);
  
  const fileInputRef = useRef(null);

  // Check for profile picture changes
  useEffect(() => {
    if (user?.profilePicture !== lastProfilePicture) {
      console.log('Profile picture changed:', {
        old: lastProfilePicture,
        new: user?.profilePicture
      });
      setLastProfilePicture(user?.profilePicture);
      setRetryCount(0); // Reset retry count when profile picture changes
    }
  }, [user?.profilePicture, lastProfilePicture]);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Show cropper instead of uploading directly
    setSelectedFile(file);
    setShowCropper(true);
    setShowUploadModal(false);
  };

  const handleDirectUpload = async (file) => {
    setIsUploading(true);
    
    try {
      const response = await uploadProfilePicture(file);
      
      // If the response includes updated user data, we should update the user context
      if (response.data && response.data.user) {
        // User data updated successfully
      }
      
      if (onUpdate) {
        onUpdate();
      }
      // Show success message
      alert('Profile picture updated successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert(error.message || 'Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropComplete = async (croppedFile) => {
    setIsUploading(true);
    setShowCropper(false);
    setSelectedFile(null);
    
    try {
      const response = await uploadProfilePicture(croppedFile);
      
      // If the response includes updated user data, we should update the user context
      if (response.data && response.data.user) {
        // User data updated successfully
      }
      
      if (onUpdate) {
        onUpdate();
      }
      // Show success message
      alert('Profile picture updated successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert(error.message || 'Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePicture = async () => {
    if (!user.profilePicture) return;

    if (!window.confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await deleteProfilePicture();
      if (onUpdate) {
        onUpdate();
      }
      alert('Profile picture deleted successfully!');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete profile picture. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getProfileImageUrl = () => {
    if (!user.profilePicture) {
      return null;
    }
    
    // Add timestamp to prevent caching issues
    const baseUrl = getProfilePictureUrl(user._id);
    
    // Add multiple cache-busting parameters
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const version = user.profilePicture.split('-')[1] || user.profilePicture; // Use filename timestamp if available
    return `${baseUrl}?t=${timestamp}&r=${random}&v=${version}`;
  };

  // Force refresh function
  const forceRefresh = () => {
    if (onUpdate) {
      onUpdate();
    }
  };

  return (
    <>
      {/* Profile Picture Display */}
      <div className="relative group">
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 ${
          isDark ? 'border-gray-600' : 'border-gray-300'
        } flex items-center justify-center ${
          isDark ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          {user.profilePicture ? (
            <img
              src={getProfileImageUrl()}
              alt={`${user.name}'s profile`}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Failed to load profile picture:', e);
                e.target.style.display = 'none';
                // Show fallback user icon
                const userIcon = e.target.nextSibling;
                if (userIcon) {
                  userIcon.style.display = 'flex';
                }
                
                // Retry logic - try up to 3 times
                if (retryCount < 3) {
                  setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                    e.target.style.display = 'block';
                    e.target.src = getProfileImageUrl(); // Force reload with new cache-busting params
                  }, 1000 * (retryCount + 1)); // Exponential backoff
                } else {
                  // Try to refresh user data in case the profile picture was updated
                  if (onUpdate) {
                    setTimeout(() => onUpdate(), 1000);
                  }
                }
              }}
              onLoad={(e) => {
                console.log('Profile picture loaded successfully');
                // Hide fallback icon when image loads successfully
                const userIcon = e.target.nextSibling;
                if (userIcon) {
                  userIcon.style.display = 'none';
                }
              }}
            />
          ) : null}
          <User className={`${iconSizes[size]} ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          } ${user.profilePicture ? 'hidden' : ''}`} />
        </div>

        {/* Upload/Change Overlay - Only show if showUploadButton is true */}
        {showUploadButton && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <button
              onClick={() => setShowUploadModal(true)}
              className={`p-1 rounded-full ${
                isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'
              } transition-colors`}
              title="Change profile picture"
            >
              <Camera className={`${iconSizes[size === 'xl' ? 'lg' : 'md']} ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`} />
            </button>
          </div>
        )}

        {/* Delete Button (if picture exists and showUploadButton is true) */}
        {user.profilePicture && showUploadButton && (
          <button
            onClick={handleDeletePicture}
            disabled={isDeleting}
            className={`absolute -top-1 -right-1 p-1 rounded-full ${
              isDark ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
            } text-white transition-colors disabled:opacity-50`}
            title="Delete profile picture"
          >
            {isDeleting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <X className="h-3 w-3" />
            )}
          </button>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className={`max-w-md w-full rounded-lg shadow-xl ${
            isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Upload Profile Picture</h3>
              
              <div className="space-y-4">
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className={`mx-auto mb-2 ${iconSizes.lg} ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Click to select an image file
                  </p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Max size: 5MB, Supported formats: JPG, PNG, GIF
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    disabled={isUploading}
                    className={`px-4 py-2 rounded-lg ${
                      isDark 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    } transition-colors disabled:opacity-50`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className={`px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center`}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Uploading...
                      </>
                    ) : (
                      'Select File'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Cropper */}
      {showCropper && selectedFile && (
        <ImageCropper
          imageFile={selectedFile}
          onCrop={handleCropComplete}
          onCancel={() => {
            setShowCropper(false);
            setSelectedFile(null);
          }}
          isDark={isDark}
        />
      )}
    </>
  );
};

export default ProfilePicture;
