const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const { optionalAuth } = require('../middleware/auth');

// Get all products
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    const products = await Product.find(query).sort({ created_at: -1 }).lean();

    // Get unique categories for filter
    const uniqueCategories = await Product.distinct('category');

    res.render('products/index', {
      title: 'Traditional Products - Visit Assam',
      products: products || [],
      categories: uniqueCategories || [],
      selectedCategory: category || null,
      user: req.user || null
    });
  } catch (error) {
    console.error('Products error:', error);
    res.render('products/index', {
      title: 'Traditional Products',
      products: [],
      categories: [],
      selectedCategory: null,
      user: null
    });
  }
});

// Get single product
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).lean();

    if (!product) {
      return res.status(404).render('404', { title: 'Product Not Found' });
    }

    // Get related products
    let relatedProducts = [];
    if (product.category_id) {
      relatedProducts = await Product.find({ 
        category_id: product.category_id, 
        _id: { $ne: id } 
      }).limit(3).lean();
    } else {
      relatedProducts = await Product.find({ _id: { $ne: id } }).limit(3).lean();
    }

    res.render('products/show', {
      title: `${product.name} - Visit Assam`,
      product,
      relatedProducts: relatedProducts || [],
      user: req.user || null
    });
  } catch (error) {
    console.error('Product detail error:', error);
    res.status(500).render('error', { 
      title: 'Error',
      message: 'Failed to load product details'
    });
  }
});

module.exports = router;

