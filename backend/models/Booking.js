const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'RailwayService', required: true },
  route: { type: String, required: true },
  quantity: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled', 'Declined', 'Cancellation Requested', 'Goods Received at Origin', 'In Transit', 'Arrived at Destination', 'Ready for Pickup', 'Out for Delivery', 'Delivered'], default: 'Pending' },
  date: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);