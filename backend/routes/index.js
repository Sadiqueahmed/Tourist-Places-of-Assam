const express = require('express');
const router = express.Router();
const Place = require('../models/Place');
const Event = require('../models/Event');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Adventure = require('../models/Adventure');
const Category = require('../models/Category');
const { optionalAuth } = require('../middleware/auth');

// Home page
router.get('/', optionalAuth, async (req, res) => {
  try {
    // Fetch featured places
    const places = await Place.find({ featured: true }).limit(6).lean();

    // Fetch upcoming events
    const events = await Event.find({ date: { $gte: new Date() } })
      .sort({ date: 1 })
      .limit(4)
      .lean();

    // Fetch products
    const products = await Product.find().limit(5).lean();

    // Fetch reviews
    const reviews = await Review.find()
      .populate('user_id', 'name')
      .sort({ created_at: -1 })
      .limit(6)
      .lean();
      
    // Map reviews to match the EJS template structure `review.users.name`
    const formattedReviews = reviews.map(r => ({
      ...r,
      users: r.user_id ? { name: r.user_id.name } : { name: 'Anonymous' }
    }));

    res.render('index', {
      title: 'Visit Assam - Explore the Beauty of Northeast India',
      places: places || [],
      events: events || [],
      products: products || [],
      reviews: formattedReviews || [],
      user: req.user || null
    });
  } catch (error) {
    console.error('Home page error:', error);
    res.render('index', {
      title: 'Visit Assam',
      places: [],
      events: [],
      products: [],
      reviews: [],
      user: null
    });
  }
});

// About page
router.get('/about', optionalAuth, (req, res) => {
  res.render('about', {
    title: 'About Us - Visit Assam',
    user: req.user || null
  });
});

// Adventure page
router.get('/adventure', optionalAuth, async (req, res) => {
  try {
    const adventures = await Adventure.find().sort({ created_at: -1 }).lean();

    res.render('adventure', {
      title: 'Adventure Activities - Visit Assam',
      adventures: adventures || [],
      user: req.user || null
    });
  } catch (error) {
    console.error('Adventure page error:', error);
    res.render('adventure', {
      title: 'Adventure Activities',
      adventures: [],
      user: null
    });
  }
});

// Discover page
router.get('/discover', optionalAuth, async (req, res) => {
  try {
    const categories = await Category.find().lean();
    const places = await Place.find().sort({ rating: -1 }).lean();

    res.render('discover', {
      title: 'Discover Assam - Tourist Destinations',
      categories: categories || [],
      places: places || [],
      user: req.user || null
    });
  } catch (error) {
    console.error('Discover page error:', error);
    res.render('discover', {
      title: 'Discover Assam',
      categories: [],
      places: [],
      user: null
    });
  }
});

module.exports = router;

