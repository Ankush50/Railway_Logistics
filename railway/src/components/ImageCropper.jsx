import React, { useState, useRef, useEffect } from 'react';
import { X, Check, RotateCw } from 'lucide-react';

const ImageCropper = ({ imageFile, onCrop, onCancel, isDark = false }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 200, height: 200 });
  const [imageSrc, setImageSrc] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target.result);
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
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
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragStart.x;
    const y = e.clientY - rect.top - dragStart.y;
    
    // Constrain crop area within canvas bounds
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
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const image = imageRef.current;
    
    // Create a new canvas for the cropped image
    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');
    
    // Set canvas size to crop dimensions
    croppedCanvas.width = crop.width;
    croppedCanvas.height = crop.height;
    
    // Apply rotation and crop
    croppedCtx.save();
    croppedCtx.translate(crop.width / 2, crop.height / 2);
    croppedCtx.rotate((rotation * Math.PI) / 180);
    croppedCtx.drawImage(
      image,
      crop.x, crop.y, crop.width, crop.height,
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
          
          <div className="relative overflow-hidden rounded-lg border-2 border-gray-300">
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              className="block w-full h-auto cursor-move"
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
                  height: 'auto'
                }}
                onLoad={(e) => {
                  // Initialize crop to center of image
                  const img = e.target;
                  const canvas = canvasRef.current;
                  const scale = Math.min(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
                  const scaledWidth = img.naturalWidth * scale;
                  const scaledHeight = img.naturalHeight * scale;
                  
                  setCrop({
                    x: (canvas.width - scaledWidth) / 2,
                    y: (canvas.height - scaledHeight) / 2,
                    width: scaledWidth,
                    height: scaledHeight
                  });
                }}
              />
            </canvas>
            
            {/* Crop overlay */}
            <div
              className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20 pointer-events-none"
              style={{
                left: crop.x,
                top: crop.y,
                width: crop.width,
                height: crop.height
              }}
            />
            
            {/* Resize handles */}
            {['nw', 'ne', 'sw', 'se'].map((corner) => (
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
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center"
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
