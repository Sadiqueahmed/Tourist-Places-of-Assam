const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  const token = req.session.token || req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).redirect('/auth/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user exists in database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      req.session.destroy();
      return res.status(401).redirect('/auth/login');
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    req.session.destroy();
    return res.status(403).redirect('/auth/login');
  }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  req.flash('error_msg', 'Access denied. Admin privileges required.');
  return res.redirect('/');
};

// Check if user is logged in (for views)
const isLoggedIn = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  
  req.flash('error_msg', 'Please log in to access this page');
  res.redirect('/auth/login');
};

// Optional auth (doesn't redirect, just sets user if exists)
const optionalAuth = async (req, res, next) => {
  const token = req.session.token;
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.userId)
        .single();
      
      if (user) {
        req.user = user;
        res.locals.user = user;
      }
    } catch (error) {
      // Token invalid, but continue
    }
  }
  
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  isLoggedIn,
  optionalAuth
};

