import React from 'react';
import { CheckCircle, Circle, Clock, Package, Truck, MapPin, Home } from 'lucide-react';

const TrackingTimeline = ({ currentStatus, isDark }) => {
  // Define the tracking steps in order
  const trackingSteps = [
    {
      id: 'Pending',
      title: 'Booking Pending',
      description: 'Booking submitted and awaiting confirmation',
      icon: Clock,
      color: 'text-gray-400'
    },
    {
      id: 'Confirmed',
      title: 'Booking Confirmed',
      description: 'Booking has been confirmed by admin',
      icon: CheckCircle,
      color: 'text-green-500'
    },
    {
      id: 'Goods Received at Origin',
      title: 'Goods Received',
      description: 'Goods received at origin station',
      icon: Package,
      color: 'text-blue-500'
    },
    {
      id: 'In Transit',
      title: 'In Transit',
      description: 'Goods are being transported',
      icon: Truck,
      color: 'text-orange-500'
    },
    {
      id: 'Arrived at Destination',
      title: 'Arrived at Destination',
      description: 'Goods arrived at destination station',
      icon: MapPin,
      color: 'text-purple-500'
    },
    {
      id: 'Ready for Pickup',
      title: 'Ready for Pickup',
      description: 'Goods ready for pickup',
      icon: Home,
      color: 'text-indigo-500'
    },
    {
      id: 'Out for Delivery',
      title: 'Out for Delivery',
      description: 'Goods are out for delivery',
      icon: Truck,
      color: 'text-pink-500'
    },
    {
      id: 'Delivered',
      title: 'Delivered',
      description: 'Goods have been delivered',
      icon: CheckCircle,
      color: 'text-green-600'
    }
  ];

  // Find the current step index
  const currentStepIndex = trackingSteps.findIndex(step => step.id === currentStatus);
  
  // Handle cancelled/declined statuses
  const isCancelled = ['Cancelled', 'Declined', 'Cancellation Requested'].includes(currentStatus);

  return (
    <div className={`p-6 rounded-lg border ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } shadow-sm`}>
      <h3 className={`text-lg font-semibold mb-4 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        Shipment Tracking
      </h3>
      
      {isCancelled ? (
        <div className={`text-center py-8 ${
          isDark ? 'text-red-300' : 'text-red-600'
        }`}>
          <Circle className="h-12 w-12 mx-auto mb-3" />
          <p className="text-lg font-medium">Booking {currentStatus}</p>
          <p className="text-sm mt-1 opacity-75">
            {currentStatus === 'Cancelled' && 'This booking has been cancelled'}
            {currentStatus === 'Declined' && 'This booking has been declined'}
            {currentStatus === 'Cancellation Requested' && 'Cancellation request is pending approval'}
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className={`absolute left-6 top-0 bottom-0 w-0.5 ${
            isDark ? 'bg-gray-600' : 'bg-gray-300'
          }`}></div>
          
          {trackingSteps.map((step, index) => {
            const IconComponent = step.icon;
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            
            return (
              <div key={step.id} className="relative flex items-start mb-6 last:mb-0">
                {/* Timeline dot */}
                <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  isCompleted 
                    ? `${step.color} border-current bg-current/10` 
                    : `${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100'}`
                }`}>
                  <IconComponent className={`h-6 w-6 ${
                    isCompleted ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
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
                  
                  {/* Current status indicator */}
                  {isCurrent && (
                    <div className={`inline-flex items-center mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                      isDark 
                        ? 'bg-blue-900/30 text-blue-300 border border-blue-700' 
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                      <div className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse"></div>
                      Current Status
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrackingTimeline;
