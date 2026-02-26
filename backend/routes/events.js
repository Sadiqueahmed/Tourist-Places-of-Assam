const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { optionalAuth } = require('../middleware/auth');

// Get all events
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;

    res.render('events/index', {
      title: 'Events & Festivals - Visit Assam',
      events: events || [],
      user: req.user || null
    });
  } catch (error) {
    console.error('Events error:', error);
    res.render('events/index', {
      title: 'Events & Festivals',
      events: [],
      user: null
    });
  }
});

// Get single event
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !event) {
      return res.status(404).render('404', { title: 'Event Not Found' });
    }

    res.render('events/show', {
      title: `${event.title} - Visit Assam`,
      event,
      user: req.user || null
    });
  } catch (error) {
    console.error('Event detail error:', error);
    res.status(500).render('error', { 
      title: 'Error',
      message: 'Failed to load event details'
    });
  }
});

module.exports = router;

