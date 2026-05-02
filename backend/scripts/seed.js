require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Place = require('../models/Place');
const Event = require('../models/Event');
const Product = require('../models/Product');
const Category = require('../models/Category');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tourist_assam';

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Place.deleteMany({});
    await Event.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});

    console.log('Seeding Categories...');
    const placeCat = await Category.create({ name: 'Destinations', type: 'place', description: 'Tourist Destinations' });
    const productCat = await Category.create({ name: 'Handicrafts', type: 'product', description: 'Local Handicrafts' });

    console.log('Seeding Admin User...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    await User.create({
      name: 'Admin User',
      email: 'admin@visitassam.com',
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Seeding Places...');
    await Place.create([
      {
        name: 'Kaziranga National Park',
        description: 'Famous for the Great Indian one-horned rhinoceros, the landscape of Kaziranga is of sheer forest, tall elephant grass, rugged reeds, marshes & shallow pools.',
        location: 'Kanchanjuri, Assam',
        category_id: placeCat._id,
        image_url: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?q=80&w=1000&auto=format&fit=crop',
        rating: 4.8
      },
      {
        name: 'Majuli Island',
        description: 'Majuli is a lush green environment-friendly, pristine and pollution-free fresh water island in the river Brahmaputra.',
        location: 'Majuli, Assam',
        category_id: placeCat._id,
        image_url: 'https://images.unsplash.com/photo-1622308644420-b20141d20ee0?q=80&w=1000&auto=format&fit=crop',
        rating: 4.6
      }
    ]);

    console.log('Seeding Events...');
    await Event.create([
      {
        title: 'Bihu Festival',
        description: 'The most important non-religious festival of Assam, celebrated with great enthusiasm.',
        date: new Date('2026-04-14'),
        location: 'Statewide',
        image_url: 'https://images.unsplash.com/photo-1644342203175-1e3532288ea5?q=80&w=1000&auto=format&fit=crop'
      }
    ]);

    console.log('Seeding Products...');
    await Product.create([
      {
        name: 'Assam Tea',
        description: 'Authentic strong and malty Assam black tea.',
        price: 250,
        category_id: productCat._id,
        image_url: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cbf9?q=80&w=1000&auto=format&fit=crop'
      },
      {
        name: 'Muga Silk Saree',
        description: 'Traditional Assamese silk known for its extreme durability and natural yellowish-golden tint.',
        price: 5000,
        category_id: productCat._id,
        image_url: 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?q=80&w=1000&auto=format&fit=crop'
      }
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
