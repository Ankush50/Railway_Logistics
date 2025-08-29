const Booking = require('../models/Booking');
const RailwayService = require('../models/RailwayService');

// Create a booking
exports.createBooking = async (req, res, next) => {
  try {
    const { serviceId, quantity } = req.body;
    
    // Get service
    const service = await RailwayService.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    
    // Check availability
    if (service.available < quantity) {
      return res.status(400).json({ success: false, message: 'Not enough capacity available' });
    }
    
    // Calculate total
    const total = quantity * service.pricePerTon;
    
    // Create booking
    const booking = await Booking.create({
      userId: req.user.id,
      serviceId,
      route: service.route,
      quantity,
      total,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending'
    });
    
    // Update service availability
    service.available -= quantity;
    await service.save();
    
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// Get user bookings
exports.getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).populate('serviceId');
    res.status(200).json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
};

// Admin: get all bookings with user details
exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({}).populate('serviceId').populate('userId', 'name username email phone role');
    res.status(200).json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
};

// Admin: update booking status
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['Pending', 'Confirmed', 'Cancelled', 'Declined'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    booking.status = status;
    await booking.save();
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};