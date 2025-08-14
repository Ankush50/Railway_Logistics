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