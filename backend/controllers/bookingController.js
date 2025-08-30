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
    const allowed = ['Pending', 'Confirmed', 'Cancelled', 'Declined', 'Cancellation Requested'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    const booking = await Booking.findById(id).populate('serviceId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    const previousStatus = booking.status;
    booking.status = status;
    await booking.save();
    
    // If booking is being cancelled or declined, restore the service capacity
    if ((status === 'Cancelled' || status === 'Declined') && 
        (previousStatus !== 'Cancelled' && previousStatus !== 'Declined')) {
      const service = await RailwayService.findById(booking.serviceId._id);
      if (service) {
        service.available += booking.quantity;
        await service.save();
      }
    }
    
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// User: request cancellation for pending booking
exports.requestCancellation = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find the booking
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // Check if user owns this booking
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }
    
    // Check if booking is in pending status
    if (booking.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Can only cancel pending bookings' });
    }
    
    // Update status to cancellation requested
    booking.status = 'Cancellation Requested';
    await booking.save();
    
    res.status(200).json({ 
      success: true, 
      data: booking,
      message: 'Cancellation request submitted successfully. Admin will review and approve.'
    });
  } catch (err) {
    next(err);
  }
};