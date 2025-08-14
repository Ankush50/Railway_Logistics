const RailwayService = require('../models/RailwayService');

// Get all services
exports.getServices = async (req, res, next) => {
  try {
    const services = await RailwayService.find();
    res.status(200).json({ success: true, data: services });
  } catch (err) {
    next(err);
  }
};

// Search services
exports.searchServices = async (req, res, next) => {
  try {
    const { from, to, date, weight } = req.query;

    const query = {};

    // Match either origin or destination text anywhere in the route string
    if (from || to) {
      const orClauses = [];
      if (from) orClauses.push({ route: { $regex: from, $options: 'i' } });
      if (to) orClauses.push({ route: { $regex: to, $options: 'i' } });
      if (orClauses.length > 0) {
        query.$or = orClauses;
      }
    }

    if (date) {
      query.date = date;
    }

    if (weight) {
      query.available = { $gte: parseInt(weight, 10) };
    }

    const services = await RailwayService.find(query);
    res.status(200).json({ success: true, data: services });
  } catch (err) {
    next(err);
  }
};

// Create a new service (admin only)
exports.createService = async (req, res, next) => {
  try {
    const service = await RailwayService.create(req.body);
    res.status(201).json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

// Update a service (admin only)
exports.updateService = async (req, res, next) => {
  try {
    const service = await RailwayService.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    
    res.status(200).json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

// Delete a service (admin only)
exports.deleteService = async (req, res, next) => {
  try {
    const service = await RailwayService.findByIdAndDelete(req.params.id);
    
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};