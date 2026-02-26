const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/supabase');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'backend/public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Apply authentication and admin check to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Admin Dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // Get counts
    const { count: placesCount } = await supabase
      .from('places')
      .select('*', { count: 'exact', head: true });
    
    const { count: eventsCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });
    
    const { count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    const { count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get recent reviews
    const { data: recentReviews } = await supabase
      .from('reviews')
      .select('*, users(name), places(name)')
      .order('created_at', { ascending: false })
      .limit(5);

    res.render('admin/dashboard', {
      title: 'Admin Dashboard - Visit Assam',
      user: req.user,
      stats: {
        places: placesCount || 0,
        events: eventsCount || 0,
        products: productsCount || 0,
        users: usersCount || 0
      },
      recentReviews: recentReviews || []
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      user: req.user,
      stats: { places: 0, events: 0, products: 0, users: 0 },
      recentReviews: []
    });
  }
});

// ==================== PLACES MANAGEMENT ====================

// List all places
router.get('/places', async (req, res) => {
  try {
    const { data: places, error } = await supabase
      .from('places')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.render('admin/places', {
      title: 'Manage Places - Admin',
      user: req.user,
      places: places || []
    });
  } catch (error) {
    console.error('Admin places error:', error);
    req.flash('error_msg', 'Failed to load places');
    res.render('admin/places', {
      title: 'Manage Places',
      user: req.user,
      places: []
    });
  }
});

// Add place form
router.get('/places/add', async (req, res) => {
  try {
    const { data: categories } = await supabase
      .from('categories')
      .select('*');

    res.render('admin/place-form', {
      title: 'Add Place - Admin',
      user: req.user,
      place: null,
      categories: categories || [],
      action: 'add'
    });
  } catch (error) {
    console.error('Add place form error:', error);
    res.render('admin/place-form', {
      title: 'Add Place',
      user: req.user,
      place: null,
      categories: [],
      action: 'add'
    });
  }
});

// Create place
router.post('/places', upload.single('image'), async (req, res) => {
  try {
    const { name, description, location, category, rating, featured } = req.body;
    
    let imageUrl = null;
    if (req.file) {
      // Upload to Supabase Storage
      const filePath = `places/${Date.now()}_${req.file.filename}`;
      const { data: uploadData, error: uploadError } = await supabaseAdmin
        .storage
        .from('images')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype
        });
      
      if (!uploadError) {
        const { data: { publicUrl } } = supabaseAdmin
          .storage
          .from('images')
          .getPublicUrl(filePath);
        imageUrl = publicUrl;
      }
    }

    const { error } = await supabase
      .from('places')
      .insert([{
        name,
        description,
        location,
        category,
        rating: rating || 0,
        featured: featured === 'on',
        image_url: imageUrl,
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;

    req.flash('success_msg', 'Place added successfully!');
    res.redirect('/admin/places');
  } catch (error) {
    console.error('Create place error:', error);
    req.flash('error_msg', 'Failed to add place');
    res.redirect('/admin/places/add');
  }
});

// Edit place form
router.get('/places/:id/edit', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: place, error } = await supabase
      .from('places')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !place) {
      req.flash('error_msg', 'Place not found');
      return res.redirect('/admin/places');
    }

    const { data: categories } = await supabase
      .from('categories')
      .select('*');

    res.render('admin/place-form', {
      title: 'Edit Place - Admin',
      user: req.user,
      place,
      categories: categories || [],
      action: 'edit'
    });
  } catch (error) {
    console.error('Edit place form error:', error);
    req.flash('error_msg', 'Failed to load place');
    res.redirect('/admin/places');
  }
});

// Update place
router.put('/places/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, location, category, rating, featured } = req.body;
    
    let updateData = {
      name,
      description,
      location,
      category,
      rating: rating || 0,
      featured: featured === 'on',
      updated_at: new Date().toISOString()
    };

    if (req.file) {
      // Upload new image to Supabase Storage
      const filePath = `places/${Date.now()}_${req.file.filename}`;
      const { data: uploadData, error: uploadError } = await supabaseAdmin
        .storage
        .from('images')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype
        });
      
      if (!uploadError) {
        const { data: { publicUrl } } = supabaseAdmin
          .storage
          .from('images')
          .getPublicUrl(filePath);
        updateData.image_url = publicUrl;
      }
    }

    const { error } = await supabase
      .from('places')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    req.flash('success_msg', 'Place updated successfully!');
    res.redirect('/admin/places');
  } catch (error) {
    console.error('Update place error:', error);
    req.flash('error_msg', 'Failed to update place');
    res.redirect(`/admin/places/${req.params.id}/edit`);
  }
});

// Delete place
router.delete('/places/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('places')
      .delete()
      .eq('id', id);

    if (error) throw error;

    req.flash('success_msg', 'Place deleted successfully!');
    res.redirect('/admin/places');
  } catch (error) {
    console.error('Delete place error:', error);
    req.flash('error_msg', 'Failed to delete place');
    res.redirect('/admin/places');
  }
});

// ==================== EVENTS MANAGEMENT ====================

// List all events
router.get('/events', async (req, res) => {
  try {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;

    res.render('admin/events', {
      title: 'Manage Events - Admin',
      user: req.user,
      events: events || []
    });
  } catch (error) {
    console.error('Admin events error:', error);
    req.flash('error_msg', 'Failed to load events');
    res.render('admin/events', {
      title: 'Manage Events',
      user: req.user,
      events: []
    });
  }
});

// Add event form
router.get('/events/add', (req, res) => {
  res.render('admin/event-form', {
    title: 'Add Event - Admin',
    user: req.user,
    event: null,
    action: 'add'
  });
});

// Create event
router.post('/events', upload.single('image'), async (req, res) => {
  try {
    const { title, description, date, location, organizer } = req.body;
    
    let imageUrl = null;
    if (req.file) {
      const filePath = `events/${Date.now()}_${req.file.filename}`;
      const { data: uploadData, error: uploadError } = await supabaseAdmin
        .storage
        .from('images')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype
        });
      
      if (!uploadError) {
        const { data: { publicUrl } } = supabaseAdmin
          .storage
          .from('images')
          .getPublicUrl(filePath);
        imageUrl = publicUrl;
      }
    }

    const { error } = await supabase
      .from('events')
      .insert([{
        title,
        description,
        date,
        location,
        organizer,
        image_url: imageUrl,
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;

    req.flash('success_msg', 'Event added successfully!');
    res.redirect('/admin/events');
  } catch (error) {
    console.error('Create event error:', error);
    req.flash('error_msg', 'Failed to add event');
    res.redirect('/admin/events/add');
  }
});

// Edit event form
router.get('/events/:id/edit', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !event) {
      req.flash('error_msg', 'Event not found');
      return res.redirect('/admin/events');
    }

    res.render('admin/event-form', {
      title: 'Edit Event - Admin',
      user: req.user,
      event,
      action: 'edit'
    });
  } catch (error) {
    console.error('Edit event form error:', error);
    req.flash('error_msg', 'Failed to load event');
    res.redirect('/admin/events');
  }
});

// Update event
router.put('/events/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, location, organizer } = req.body;
    
    let updateData = {
      title,
      description,
      date,
      location,
      organizer,
      updated_at: new Date().toISOString()
    };

    if (req.file) {
      const filePath = `events/${Date.now()}_${req.file.filename}`;
      const { data: uploadData, error: uploadError } = await supabaseAdmin
        .storage
        .from('images')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype
        });
      
      if (!uploadError) {
        const { data: { publicUrl } } = supabaseAdmin
          .storage
          .from('images')
          .getPublicUrl(filePath);
        updateData.image_url = publicUrl;
      }
    }

    const { error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    req.flash('success_msg', 'Event updated successfully!');
    res.redirect('/admin/events');
  } catch (error) {
    console.error('Update event error:', error);
    req.flash('error_msg', 'Failed to update event');
    res.redirect(`/admin/events/${req.params.id}/edit`);
  }
});

// Delete event
router.delete('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;

    req.flash('success_msg', 'Event deleted successfully!');
    res.redirect('/admin/events');
  } catch (error) {
    console.error('Delete event error:', error);
    req.flash('error_msg', 'Failed to delete event');
    res.redirect('/admin/events');
  }
});

// ==================== PRODUCTS MANAGEMENT ====================

// List all products
router.get('/products', async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.render('admin/products', {
      title: 'Manage Products - Admin',
      user: req.user,
      products: products || []
    });
  } catch (error) {
    console.error('Admin products error:', error);
    req.flash('error_msg', 'Failed to load products');
    res.render('admin/products', {
      title: 'Manage Products',
      user: req.user,
      products: []
    });
  }
});

// Add product form
router.get('/products/add', (req, res) => {
  res.render('admin/product-form', {
    title: 'Add Product - Admin',
    user: req.user,
    product: null,
    action: 'add'
  });
});

// Create product
router.post('/products', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    
    let imageUrl = null;
    if (req.file) {
      const filePath = `products/${Date.now()}_${req.file.filename}`;
      const { data: uploadData, error: uploadError } = await supabaseAdmin
        .storage
        .from('images')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype
        });
      
      if (!uploadError) {
        const { data: { publicUrl } } = supabaseAdmin
          .storage
          .from('images')
          .getPublicUrl(filePath);
        imageUrl = publicUrl;
      }
    }

    const { error } = await supabase
      .from('products')
      .insert([{
        name,
        description,
        price: parseFloat(price) || 0,
        category,
        image_url: imageUrl,
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;

    req.flash('success_msg', 'Product added successfully!');
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Create product error:', error);
    req.flash('error_msg', 'Failed to add product');
    res.redirect('/admin/products/add');
  }
});

// Edit product form
router.get('/products/:id/edit', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !product) {
      req.flash('error_msg', 'Product not found');
      return res.redirect('/admin/products');
    }

    res.render('admin/product-form', {
      title: 'Edit Product - Admin',
      user: req.user,
      product,
      action: 'edit'
    });
  } catch (error) {
    console.error('Edit product form error:', error);
    req.flash('error_msg', 'Failed to load product');
    res.redirect('/admin/products');
  }
});

// Update product
router.put('/products/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category } = req.body;
    
    let updateData = {
      name,
      description,
      price: parseFloat(price) || 0,
      category,
      updated_at: new Date().toISOString()
    };

    if (req.file) {
      const filePath = `products/${Date.now()}_${req.file.filename}`;
      const { data: uploadData, error: uploadError } = await supabaseAdmin
        .storage
        .from('images')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype
        });
      
      if (!uploadError) {
        const { data: { publicUrl } } = supabaseAdmin
          .storage
          .from('images')
          .getPublicUrl(filePath);
        updateData.image_url = publicUrl;
      }
    }

    const { error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    req.flash('success_msg', 'Product updated successfully!');
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Update product error:', error);
    req.flash('error_msg', 'Failed to update product');
    res.redirect(`/admin/products/${req.params.id}/edit`);
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    req.flash('success_msg', 'Product deleted successfully!');
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Delete product error:', error);
    req.flash('error_msg', 'Failed to delete product');
    res.redirect('/admin/products');
  }
});

// ==================== USERS MANAGEMENT ====================

// List all users
router.get('/users', async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.render('admin/users', {
      title: 'Manage Users - Admin',
      user: req.user,
      users: users || []
    });
  } catch (error) {
    console.error('Admin users error:', error);
    req.flash('error_msg', 'Failed to load users');
    res.render('admin/users', {
      title: 'Manage Users',
      user: req.user,
      users: []
    });
  }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const { error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', id);

    if (error) throw error;

    req.flash('success_msg', 'User role updated successfully!');
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Update user role error:', error);
    req.flash('error_msg', 'Failed to update user role');
    res.redirect('/admin/users');
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (id === req.user.id) {
      req.flash('error_msg', 'You cannot delete your own account');
      return res.redirect('/admin/users');
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    req.flash('success_msg', 'User deleted successfully!');
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Delete user error:', error);
    req.flash('error_msg', 'Failed to delete user');
    res.redirect('/admin/users');
  }
});

module.exports = router;

