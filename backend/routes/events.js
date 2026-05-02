const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { optionalAuth } = require('../middleware/auth');

// Get all events
router.get('/', optionalAuth, async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }).lean();

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

    const event = await Event.findById(id).lean();

    if (!event) {
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

