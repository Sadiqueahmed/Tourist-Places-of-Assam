const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { optionalAuth } = require('../middleware/auth');

// Home page
router.get('/', optionalAuth, async (req, res) => {
  try {
    // Fetch featured places
    const { data: places, error: placesError } = await supabase
      .from('places')
      .select('*')
      .eq('featured', true)
      .limit(6);

    // Fetch upcoming events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })
      .limit(4);

    // Fetch products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5);

    // Fetch reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*, users(name)')
      .order('created_at', { ascending: false })
      .limit(6);

    if (placesError) console.error('Places error:', placesError);
    if (eventsError) console.error('Events error:', eventsError);
    if (productsError) console.error('Products error:', productsError);
    if (reviewsError) console.error('Reviews error:', reviewsError);

    res.render('index', {
      title: 'Visit Assam - Explore the Beauty of Northeast India',
      places: places || [],
      events: events || [],
      products: products || [],
      reviews: reviews || [],
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
    const { data: adventures, error } = await supabase
      .from('adventures')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

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
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*');

    const { data: places, error: placesError } = await supabase
      .from('places')
      .select('*')
      .order('rating', { ascending: false });

    if (catError) console.error('Categories error:', catError);
    if (placesError) console.error('Places error:', placesError);

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

