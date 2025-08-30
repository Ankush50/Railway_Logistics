import React, { useState, useRef, useEffect } from 'react';
import { X, Check, RotateCw } from 'lucide-react';

const ImageCropper = ({ imageFile, onCrop, onCancel, isDark = false }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 200, height: 200 });
  const [imageSrc, setImageSrc] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target.result);
        setImageLoaded(false);
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  const handleImageLoad = (e) => {
    const img = e.target;
    const container = containerRef.current;
    
    if (container && img) {
      // Get container dimensions
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      // Calculate the scale to fit image in container
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      
      const scale = Math.min(containerWidth / imgWidth, containerHeight / imgHeight);
      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;
      
      setImageDimensions({ width: scaledWidth, height: scaledHeight });
      
      // Center the crop area
      const cropSize = Math.min(scaledWidth, scaledHeight) * 0.8; // 80% of the smaller dimension
      setCrop({
        x: (containerWidth - cropSize) / 2,
        y: (containerHeight - cropSize) / 2,
        width: cropSize,
        height: cropSize
      });
      
      setImageLoaded(true);
    }
  };

  const handleMouseDown = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if click is within crop area
    if (x >= crop.x && x <= crop.x + crop.width && 
        y >= crop.y && y <= crop.y + crop.height) {
      setIsDragging(true);
      setDragStart({ x: x - crop.x, y: y - crop.y });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragStart.x;
    const y = e.clientY - rect.top - dragStart.y;
    
    // Constrain crop area within container bounds
    const maxX = rect.width - crop.width;
    const maxY = rect.height - crop.height;
    
    setCrop(prev => ({
      ...prev,
      x: Math.max(0, Math.min(x, maxX)),
      y: Math.max(0, Math.min(y, maxY))
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleCrop = () => {
    if (!imageRef.current || !containerRef.current) return;
    
    const image = imageRef.current;
    const container = containerRef.current;
    
    // Create a new canvas for the cropped image
    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');
    
    // Set canvas size to crop dimensions
    croppedCanvas.width = crop.width;
    croppedCanvas.height = crop.height;
    
    // Calculate the actual image coordinates based on scale
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const imgWidth = image.naturalWidth;
    const imgHeight = image.naturalHeight;
    const scale = Math.min(containerWidth / imgWidth, containerHeight / imgHeight);
    
    // Calculate source coordinates in the original image
    const sourceX = (crop.x - (containerWidth - imgWidth * scale) / 2) / scale;
    const sourceY = (crop.y - (containerHeight - imgHeight * scale) / 2) / scale;
    const sourceWidth = crop.width / scale;
    const sourceHeight = crop.height / scale;
    
    // Apply rotation and crop
    croppedCtx.save();
    croppedCtx.translate(crop.width / 2, crop.height / 2);
    croppedCtx.rotate((rotation * Math.PI) / 180);
    croppedCtx.drawImage(
      image,
      sourceX, sourceY, sourceWidth, sourceHeight,
      -crop.width / 2, -crop.height / 2, crop.width, crop.height
    );
    croppedCtx.restore();
    
    // Convert to blob
    croppedCanvas.toBlob((blob) => {
      const croppedFile = new File([blob], 'cropped-profile.jpg', { type: 'image/jpeg' });
      onCrop(croppedFile);
    }, 'image/jpeg', 0.9);
  };

  const handleResize = (direction, delta) => {
    setCrop(prev => {
      const newCrop = { ...prev };
      
      switch (direction) {
        case 'nw':
          newCrop.x += delta;
          newCrop.y += delta;
          newCrop.width -= delta;
          newCrop.height -= delta;
          break;
        case 'ne':
          newCrop.y += delta;
          newCrop.width += delta;
          newCrop.height -= delta;
          break;
        case 'sw':
          newCrop.x += delta;
          newCrop.width -= delta;
          newCrop.height += delta;
          break;
        case 'se':
          newCrop.width += delta;
          newCrop.height += delta;
          break;
        default:
          break;
      }
      
      // Ensure minimum size
      newCrop.width = Math.max(50, newCrop.width);
      newCrop.height = Math.max(50, newCrop.height);
      
      return newCrop;
    });
  };

  if (!imageSrc) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[9999]">
      <div className={`max-w-4xl w-full rounded-lg shadow-xl ${
        isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Crop Profile Picture</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRotate}
                className={`p-2 rounded-lg ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                } transition-colors`}
                title="Rotate"
              >
                <RotateCw className="h-5 w-5" />
              </button>
              <button
                onClick={onCancel}
                className={`p-2 rounded-lg ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                } transition-colors`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div 
            ref={containerRef}
            className="relative overflow-hidden rounded-lg border-2 border-gray-300 bg-gray-100"
            style={{ width: '400px', height: '400px' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop preview"
              style={{
                transform: `rotate(${rotation}deg)`,
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`
              }}
              onLoad={handleImageLoad}
              crossOrigin="anonymous"
            />
            
            {/* Crop overlay - only show when image is loaded */}
            {imageLoaded && (
              <div
                className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20 pointer-events-none"
                style={{
                  left: crop.x,
                  top: crop.y,
                  width: crop.width,
                  height: crop.height
                }}
              />
            )}
            
            {/* Resize handles - only show when image is loaded */}
            {imageLoaded && ['nw', 'ne', 'sw', 'se'].map((corner) => (
              <div
                key={corner}
                className="absolute w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-pointer"
                style={{
                  left: corner.includes('w') ? crop.x - 8 : crop.x + crop.width - 8,
                  top: corner.includes('n') ? crop.y - 8 : crop.y + crop.height - 8
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  const startX = e.clientX;
                  const startY = e.clientY;
                  
                  const handleMouseMove = (e) => {
                    const deltaX = e.clientX - startX;
                    const deltaY = e.clientY - startY;
                    const delta = Math.max(deltaX, deltaY);
                    handleResize(corner, delta);
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              />
            ))}
          </div>
          
          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className={`px-4 py-2 rounded-lg ${
                isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
              } transition-colors`}
            >
              Cancel
            </button>
            <button
              onClick={handleCrop}
              disabled={!imageLoaded}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="h-4 w-4 mr-2" />
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
