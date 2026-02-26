const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { optionalAuth } = require('../middleware/auth');

// Get all places
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let query = supabase.from('places').select('*');
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    
    const { data: places, error } = await query.order('rating', { ascending: false });

    if (error) throw error;

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
    const { data: place, error: placeError } = await supabase
      .from('places')
      .select('*')
      .eq('id', id)
      .single();

    if (placeError || !place) {
      return res.status(404).render('404', { title: 'Place Not Found' });
    }

    // Get reviews for this place
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*, users(name)')
      .eq('place_id', id)
      .order('created_at', { ascending: false });

    if (reviewsError) console.error('Reviews error:', reviewsError);

    // Get related places
    const { data: relatedPlaces, error: relatedError } = await supabase
      .from('places')
      .select('*')
      .eq('category', place.category)
      .neq('id', id)
      .limit(3);

    if (relatedError) console.error('Related places error:', relatedError);

    res.render('places/show', {
      title: `${place.name} - Visit Assam`,
      place,
      reviews: reviews || [],
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
    const { error } = await supabase
      .from('reviews')
      .insert([
        {
          place_id: id,
          user_id: userId,
          rating: parseInt(rating),
          comment,
          created_at: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Review submission error:', error);
      req.flash('error_msg', 'Failed to submit review');
      return res.redirect(`/places/${id}`);
    }

    // Update place rating
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('place_id', id);

    if (reviews && reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      
      await supabase
        .from('places')
        .update({ rating: avgRating.toFixed(1) })
        .eq('id', id);
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

