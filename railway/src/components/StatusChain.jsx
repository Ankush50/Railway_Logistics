import React from 'react';
import { CheckCircle, Circle, Clock, Package, Truck, MapPin, Home } from 'lucide-react';

const StatusChain = ({ currentStatus, isDark, isAdmin, onStatusUpdate }) => {
  // Define the tracking steps in order
  const trackingSteps = [
    {
      id: 'Pending',
      title: 'Pending',
      description: 'Awaiting confirmation',
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500',
      borderColor: 'border-yellow-500'
    },
    {
      id: 'Confirmed',
      title: 'Confirmed',
      description: 'Booking confirmed',
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500',
      borderColor: 'border-green-500'
    },
    {
      id: 'Goods Received at Origin',
      title: 'Goods Received',
      description: 'At origin station',
      icon: Package,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500',
      borderColor: 'border-blue-500'
    },
    {
      id: 'In Transit',
      title: 'In Transit',
      description: 'Being transported',
      icon: Truck,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500',
      borderColor: 'border-orange-500'
    },
    {
      id: 'Arrived at Destination',
      title: 'Arrived',
      description: 'At destination',
      icon: MapPin,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500',
      borderColor: 'border-purple-500'
    },
    {
      id: 'Ready for Pickup',
      title: 'Ready',
      description: 'Ready for pickup',
      icon: Home,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500',
      borderColor: 'border-indigo-500'
    },
    {
      id: 'Out for Delivery',
      title: 'Out for Delivery',
      description: 'On final delivery',
      icon: Truck,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500',
      borderColor: 'border-pink-500'
    },
    {
      id: 'Delivered',
      title: 'Delivered',
      description: 'Successfully delivered',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-600',
      borderColor: 'border-green-600'
    }
  ];

  // Find the current step index
  const currentStepIndex = trackingSteps.findIndex(step => step.id === currentStatus);
  
  // Handle cancelled/declined statuses
  const isCancelled = ['Cancelled', 'Declined', 'Cancellation Requested'].includes(currentStatus);

  if (isCancelled) {
    return (
      <div className={`p-4 rounded-lg border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } shadow-sm`}>
        <div className={`text-center py-4 ${
          isDark ? 'text-red-300' : 'text-red-600'
        }`}>
          <Circle className="h-8 w-8 mx-auto mb-2" />
          <p className="font-medium">Booking {currentStatus}</p>
          <p className="text-sm mt-1 opacity-75">
            {currentStatus === 'Cancelled' && 'This booking has been cancelled'}
            {currentStatus === 'Declined' && 'This booking has been declined'}
            {currentStatus === 'Cancellation Requested' && 'Cancellation request is pending approval'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg border ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } shadow-sm`}>
      <h3 className={`text-lg font-semibold mb-4 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        Status Progress
      </h3>
      
      {/* Desktop Horizontal Layout */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Progress Line */}
          <div className={`absolute top-6 left-0 right-0 h-0.5 ${
            isDark ? 'bg-gray-600' : 'bg-gray-300'
          }`}></div>
          
          <div className="flex justify-between relative z-10">
            {trackingSteps.map((step, index) => {
              const IconComponent = step.icon;
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  {/* Status Circle */}
                  <div className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                    isCompleted 
                      ? `${step.borderColor} ${step.bgColor} text-white` 
                      : `${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100'} ${isDark ? 'text-gray-400' : 'text-gray-500'}`
                  }`}>
                    <IconComponent className="h-6 w-6" />
                    
                    {/* Current Status Indicator */}
                    {isCurrent && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white animate-pulse"></div>
                    )}
                  </div>
                  
                  {/* Status Text */}
                  <div className="mt-2 text-center max-w-20">
                    <div className={`text-xs font-medium ${
                      isCompleted 
                        ? step.color 
                        : isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </div>
                    <div className={`text-xs mt-1 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {step.description}
                    </div>
                  </div>
                  
                  {/* Admin Click Handler */}
                  {isAdmin && (
                    <button
                      onClick={() => onStatusUpdate(step.id)}
                      className={`mt-2 px-2 py-1 text-xs rounded transition-colors ${
                        isCompleted
                          ? `${step.bgColor} text-white hover:opacity-80`
                          : isDark
                            ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                      title={`Set status to ${step.title}`}
                    >
                      {isCurrent ? 'Current' : 'Set'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Mobile Vertical Layout */}
      <div className="md:hidden">
        <div className="relative">
          {/* Vertical Progress Line */}
          <div className={`absolute left-6 top-0 bottom-0 w-0.5 ${
            isDark ? 'bg-gray-600' : 'bg-gray-300'
          }`}></div>
          
          <div className="space-y-4">
            {trackingSteps.map((step, index) => {
              const IconComponent = step.icon;
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <div key={step.id} className="relative flex items-start">
                  {/* Status Circle */}
                  <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                    isCompleted 
                      ? `${step.borderColor} ${step.bgColor} text-white` 
                      : `${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100'} ${isDark ? 'text-gray-400' : 'text-gray-500'}`
                  }`}>
                    <IconComponent className="h-6 w-6" />
                    
                    {/* Current Status Indicator */}
                    {isCurrent && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white animate-pulse"></div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="ml-4 flex-1">
                    <div className={`font-medium ${
                      isCompleted 
                        ? step.color 
                        : isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </div>
                    <div className={`text-sm mt-1 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {step.description}
                    </div>
                    
                    {/* Admin Click Handler */}
                    {isAdmin && (
                      <button
                        onClick={() => onStatusUpdate(step.id)}
                        className={`mt-2 px-3 py-1 text-xs rounded transition-colors ${
                          isCompleted
                            ? `${step.bgColor} text-white hover:opacity-80`
                            : isDark
                              ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                        title={`Set status to ${step.title}`}
                      >
                        {isCurrent ? 'Current Status' : `Set to ${step.title}`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusChain;
