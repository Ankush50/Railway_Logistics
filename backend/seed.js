require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const RailwayService = require('./models/RailwayService');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/railway_logistics';

async function seed() {
  await mongoose.connect(MONGODB_URI);

  // Create admin if not exists
  const adminUsername = 'admin';
  const adminEmail = 'admin@railway.com';
  let admin = await User.findOne({ username: adminUsername });
  if (!admin) {
    admin = await User.create({
      username: adminUsername,
      password: 'admin123',
      email: adminEmail,
      name: 'System Administrator',
      role: 'admin',
    });
    console.log('Created admin user: admin/admin123');
  } else {
    console.log('Admin user already exists');
  }

  // Seed services if none
  const count = await RailwayService.countDocuments();
  if (count === 0) {
    const today = new Date();
    const fmt = (d) => d.toISOString().split('T')[0];
    const services = [
      {
        route: 'Delhi - Mumbai',
        departure: '08:00',
        arrival: '18:00',
        capacity: 50,
        available: 35,
        pricePerTon: 2000,
        contact: '9876543210',
        date: fmt(today),
      },
      {
        route: 'Mumbai - Chennai',
        departure: '14:00',
        arrival: '08:00+1',
        capacity: 40,
        available: 25,
        pricePerTon: 2500,
        contact: '9876543211',
        date: fmt(new Date(today.getTime() + 24 * 60 * 60 * 1000)),
      },
      {
        route: 'Chennai - Bangalore',
        departure: '10:00',
        arrival: '16:00',
        capacity: 30,
        available: 20,
        pricePerTon: 1800,
        contact: '9876543212',
        date: fmt(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)),
      },
    ];
    await RailwayService.insertMany(services);
    console.log('Seeded sample railway services');
  } else {
    console.log('Services already present; skipping seeding');
  }

  await mongoose.disconnect();
}

seed()
  .then(() => {
    console.log('Seeding completed');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seeding failed', err);
    process.exit(1);
  });


