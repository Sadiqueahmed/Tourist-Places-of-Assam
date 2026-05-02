const express = require('express');
const router = express.Router();
const Place = require('../models/Place');
const Category = require('../models/Category');
const Review = require('../models/Review');
const { optionalAuth } = require('../middleware/auth');

// Get all places
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let query = {};
    
    if (category) {
      const categoryObj = await Category.findOne({ name: category }).lean();
      if (categoryObj) {
        query.category_id = categoryObj._id;
      } else {
        query.category_id = null;
      }
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const placesData = await Place.find(query).sort({ rating: -1 }).populate('category_id').lean();
    const places = placesData.map(p => ({
      ...p,
      category: p.category_id ? p.category_id.name : null,
      id: p._id
    }));

    res.render('places/index', {
      title: 'Tourist Places - Visit Assam',
      places: places || [],
      user: req.user || null,
      category: category || null,
      search: search || null
    });
  } catch (error) {
    console.error('Places error:', error);
    res.render('places/index', {
      title: 'Tourist Places',
      places: [],
      user: null,
      category: null,
      search: null
    });
  }
});

// Get single place
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Get place details
    const place = await Place.findById(id).lean();

    if (!place) {
      return res.status(404).render('404', { title: 'Place Not Found' });
    }

    // Get reviews for this place
    const reviews = await Review.find({ place_id: id })
      .populate('user_id', 'name')
      .sort({ created_at: -1 })
      .lean();
      
    // Map reviews to match the EJS template structure
    const formattedReviews = reviews.map(r => ({
      ...r,
      users: r.user_id ? { name: r.user_id.name } : { name: 'Anonymous' }
    }));

    // Get related places
    let relatedPlaces = [];
    if (place.category_id) {
      relatedPlaces = await Place.find({ 
        category_id: place.category_id, 
        _id: { $ne: id } 
      }).limit(3).lean();
    } else {
      // Fallback if no category_id
      relatedPlaces = await Place.find({ _id: { $ne: id } }).limit(3).lean();
    }

    res.render('places/show', {
      title: `${place.name} - Visit Assam`,
      place,
      reviews: formattedReviews || [],
      relatedPlaces: relatedPlaces || [],
      user: req.user || null
    });
  } catch (error) {
    console.error('Place detail error:', error);
    res.status(500).render('error', { 
      title: 'Error',
      message: 'Failed to load place details'
    });
  }
});

// Submit review
router.post('/:id/reviews', async (req, res) => {
  try {
    if (!req.session.user) {
      req.flash('error_msg', 'Please log in to submit a review');
      return res.redirect('/auth/login');
    }

    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.session.user.id;

    // Validate
    if (!rating || !comment) {
      req.flash('error_msg', 'Please provide both rating and comment');
      return res.redirect(`/places/${id}`);
    }

    // Insert review
    const newReview = new Review({
      place_id: id,
      user_id: userId,
      rating: parseInt(rating),
      comment
    });
    
    await newReview.save();

    // Update place rating
    const reviews = await Review.find({ place_id: id });

    if (reviews && reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      
      await Place.findByIdAndUpdate(id, { rating: parseFloat(avgRating.toFixed(1)) });
    }

    req.flash('success_msg', 'Review submitted successfully!');
    res.redirect(`/places/${id}`);
  } catch (error) {
    console.error('Review error:', error);
    req.flash('error_msg', 'An error occurred');
    res.redirect(`/places/${req.params.id}`);
  }
});

module.exports = router;

