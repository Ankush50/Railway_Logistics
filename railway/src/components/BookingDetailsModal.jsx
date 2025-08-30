import React from 'react';
import { X, Calendar, MapPin, Package, DollarSign, User, Clock } from 'lucide-react';
import StatusChain from './StatusChain';

const BookingDetailsModal = ({ booking, isOpen, onClose, isDark, currentUser, onStatusUpdate }) => {
  if (!isOpen || !booking) return null;

  const getStatusColor = (status) => {
    const statusColors = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Confirmed': 'bg-green-100 text-green-800 border-green-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200',
      'Declined': 'bg-red-100 text-red-800 border-red-200',
      'Cancellation Requested': 'bg-orange-100 text-orange-800 border-orange-200',
      'Goods Received at Origin': 'bg-blue-100 text-blue-800 border-blue-200',
      'In Transit': 'bg-purple-100 text-purple-800 border-purple-200',
      'Arrived at Destination': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Ready for Pickup': 'bg-pink-100 text-pink-800 border-pink-200',
      'Out for Delivery': 'bg-teal-100 text-teal-800 border-teal-200',
      'Delivered': 'bg-green-100 text-green-800 border-green-200'
    };
    
    const darkStatusColors = {
      'Pending': 'bg-yellow-900/30 text-yellow-300 border-yellow-700',
      'Confirmed': 'bg-green-900/30 text-green-300 border-green-700',
      'Cancelled': 'bg-red-900/30 text-red-300 border-red-700',
      'Declined': 'bg-red-900/30 text-red-300 border-red-700',
      'Cancellation Requested': 'bg-orange-900/30 text-orange-300 border-orange-700',
      'Goods Received at Origin': 'bg-blue-900/30 text-blue-300 border-blue-700',
      'In Transit': 'bg-purple-900/30 text-purple-300 border-purple-700',
      'Arrived at Destination': 'bg-indigo-900/30 text-indigo-300 border-indigo-700',
      'Ready for Pickup': 'bg-pink-900/30 text-pink-300 border-pink-700',
      'Out for Delivery': 'bg-teal-900/30 text-teal-300 border-teal-700',
      'Delivered': 'bg-green-900/30 text-green-300 border-green-700'
    };

    return isDark ? darkStatusColors[status] || 'bg-gray-900/30 text-gray-300 border-gray-700' 
                  : statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
        isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className="text-xl font-semibold">Booking Details</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Booking Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Booking Details */}
            <div className="space-y-4">
              <h3 className={`text-lg font-medium ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Booking Information
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Calendar className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Booking Date</p>
                    <p className="font-medium">{new Date(booking.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Route</p>
                    <p className="font-medium">{booking.route}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Package className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Quantity</p>
                    <p className="font-medium">{booking.quantity} tons</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <DollarSign className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Amount</p>
                    <p className="font-medium">₹{booking.total.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Customer</p>
                    <p className="font-medium">{booking.userId?.name || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="pt-4">
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-2`}>Current Status</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                  <Clock className="h-4 w-4 mr-2" />
                  {booking.status}
                </span>
              </div>

              {/* Admin Status Update */}
              {isAdmin && (
                <div className="pt-4">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-2`}>Update Status</p>
                  <select
                    value={booking.status}
                    onChange={(e) => onStatusUpdate(booking._id, e.target.value)}
                    className={`w-full p-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-800 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Goods Received at Origin">Goods Received at Origin</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Arrived at Destination">Arrived at Destination</option>
                    <option value="Ready for Pickup">Ready for Pickup</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Declined">Declined</option>
                  </select>
                </div>
              )}
            </div>

                         {/* Right Column - Status Chain */}
             <div>
               <StatusChain 
                 currentStatus={booking.status} 
                 isDark={isDark} 
                 isAdmin={isAdmin}
                 onStatusUpdate={onStatusUpdate}
               />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
