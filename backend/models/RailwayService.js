const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  route: { type: String, required: true },
  departure: { type: String, required: true },
  arrival: { type: String, required: true },
  capacity: { type: Number, required: true },
  available: { type: Number, required: true },
  pricePerTon: { type: Number, required: true },
  contact: { type: String, required: true },
  date: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RailwayService', serviceSchema);