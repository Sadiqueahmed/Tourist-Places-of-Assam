const express = require('express');
const router = express.Router();
const Place = require('../models/Place');
const Event = require('../models/Event');
const Product = require('../models/Product');
const User = require('../models/User');
const Review = require('../models/Review');
const Category = require('../models/Category');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer-storage-cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'visit_assam',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  },
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
    const placesCount = await Place.countDocuments();
    const eventsCount = await Event.countDocuments();
    const productsCount = await Product.countDocuments();
    const usersCount = await User.countDocuments();

    // Get recent reviews
    const recentReviews = await Review.find()
      .populate('user_id', 'name')
      .populate('place_id', 'name')
      .sort({ created_at: -1 })
      .limit(5)
      .lean();
    
    // Map reviews to match the EJS template structure
    if (recentReviews) {
      recentReviews.forEach(r => {
        r.users = r.user_id ? { name: r.user_id.name } : { name: 'Anonymous' };
        r.places = r.place_id ? { name: r.place_id.name } : { name: 'Unknown Place' };
      });
    }

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
    const places = await Place.find().sort({ created_at: -1 }).lean();

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
    const categories = await Category.find().lean();

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
      imageUrl = req.file.path; // Cloudinary returns URL in path
    }

    const newPlace = new Place({
      name,
      description,
      location,
      category_id: category || null,
      rating: parseFloat(rating) || 0,
      featured: featured === 'on',
      image_url: imageUrl
    });
    
    await newPlace.save();

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
    const place = await Place.findById(req.params.id).lean();
    if (!place) {
      req.flash('error_msg', 'Place not found');
      return res.redirect('/admin/places');
    }
    const categories = await Category.find().lean();
    res.render('admin/place-form', { title: 'Edit Place', user: req.user, place, categories, action: 'edit' });
  } catch (error) {
    req.flash('error_msg', 'Error loading place');
    res.redirect('/admin/places');
  }
});

// Update place
router.put('/places/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, description, location, category, rating, featured } = req.body;
    let updateData = { name, description, location, category_id: category || null, rating: parseFloat(rating) || 0, featured: featured === 'on' };
    if (req.file) updateData.image_url = req.file.path;
    await Place.findByIdAndUpdate(req.params.id, updateData);
    req.flash('success_msg', 'Place updated');
    res.redirect('/admin/places');
  } catch (error) {
    req.flash('error_msg', 'Error updating place');
    res.redirect('/admin/places');
  }
});

// Delete place
router.delete('/places/:id', async (req, res) => {
  try {
    await Place.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Place deleted');
    res.redirect('/admin/places');
  } catch (error) {
    req.flash('error_msg', 'Error deleting place');
    res.redirect('/admin/places');
  }
});

// ==================== EVENTS MANAGEMENT ====================

// List events
router.get('/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }).lean();
    res.render('admin/events', { title: 'Manage Events', user: req.user, events });
  } catch (error) {
    req.flash('error_msg', 'Failed to load events');
    res.render('admin/events', { title: 'Manage Events', user: req.user, events: [] });
  }
});

// Add event form
router.get('/events/add', async (req, res) => {
  res.render('admin/event-form', { title: 'Add Event', user: req.user, event: null, action: 'add' });
});

// Create event
router.post('/events', upload.single('image'), async (req, res) => {
  try {
    const { title, description, location, date } = req.body;
    let imageUrl = null;
    if (req.file) imageUrl = req.file.path;
    const newEvent = new Event({ title, description, location, date, image_url: imageUrl });
    await newEvent.save();
    req.flash('success_msg', 'Event added');
    res.redirect('/admin/events');
  } catch (error) {
    req.flash('error_msg', 'Error adding event');
    res.redirect('/admin/events/add');
  }
});

// Edit event form
router.get('/events/:id/edit', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).lean();
    if (!event) return res.redirect('/admin/events');
    res.render('admin/event-form', { title: 'Edit Event', user: req.user, event, action: 'edit' });
  } catch (error) {
    res.redirect('/admin/events');
  }
});

// Update event
router.put('/events/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, description, location, date } = req.body;
    let updateData = { title, description, location, date };
    if (req.file) updateData.image_url = req.file.path;
    await Event.findByIdAndUpdate(req.params.id, updateData);
    req.flash('success_msg', 'Event updated');
    res.redirect('/admin/events');
  } catch (error) {
    res.redirect('/admin/events');
  }
});

// Delete event
router.delete('/events/:id', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Event deleted');
    res.redirect('/admin/events');
  } catch (error) {
    res.redirect('/admin/events');
  }
});

// ==================== PRODUCTS MANAGEMENT ====================

// List products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ created_at: -1 }).lean();
    res.render('admin/products', { title: 'Manage Products', user: req.user, products });
  } catch (error) {
    req.flash('error_msg', 'Failed to load products');
    res.render('admin/products', { title: 'Manage Products', user: req.user, products: [] });
  }
});

// Add product form
router.get('/products/add', async (req, res) => {
  try {
    const categories = await Category.find().lean();
    res.render('admin/product-form', { title: 'Add Product', user: req.user, product: null, categories, action: 'add' });
  } catch (error) {
    res.render('admin/product-form', { title: 'Add Product', user: req.user, product: null, categories: [], action: 'add' });
  }
});

// Create product
router.post('/products', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    let imageUrl = null;
    if (req.file) imageUrl = req.file.path;
    const newProduct = new Product({ name, description, price: parseFloat(price) || 0, category_id: category || null, image_url: imageUrl });
    await newProduct.save();
    req.flash('success_msg', 'Product added');
    res.redirect('/admin/products');
  } catch (error) {
    req.flash('error_msg', 'Error adding product');
    res.redirect('/admin/products/add');
  }
});

// Edit product form

router.get('/products/:id/edit', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id).lean();

    if (!product) {
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
      category_id: category || null
    };

    if (req.file) {
      updateData.image_url = req.file.path; // Cloudinary returns URL in path
    }

    await Product.findByIdAndUpdate(id, updateData);

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

    await Product.findByIdAndDelete(id);

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
    const users = await User.find().select('name email role created_at').sort({ created_at: -1 }).lean();
    // Rename _id to id for the template
    users.forEach(u => u.id = u._id);

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

    await User.findByIdAndUpdate(id, { role });

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
    if (id === req.user.id || id === req.user.userId) {
      req.flash('error_msg', 'You cannot delete your own account');
      return res.redirect('/admin/users');
    }

    await User.findByIdAndDelete(id);

    req.flash('success_msg', 'User deleted successfully!');
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Delete user error:', error);
    req.flash('error_msg', 'Failed to delete user');
    res.redirect('/admin/users');
  }
});

module.exports = router;

