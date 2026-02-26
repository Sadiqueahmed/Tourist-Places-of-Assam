const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { optionalAuth } = require('../middleware/auth');

// Get all products
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = supabase.from('products').select('*');
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data: products, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // Get unique categories for filter
    const { data: categories } = await supabase
      .from('products')
      .select('category')
      .order('category');

    const uniqueCategories = [...new Set(categories?.map(c => c.category) || [])];

    res.render('products/index', {
      title: 'Traditional Products - Visit Assam',
      products: products || [],
      categories: uniqueCategories,
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

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !product) {
      return res.status(404).render('404', { title: 'Product Not Found' });
    }

    // Get related products
    const { data: relatedProducts, error: relatedError } = await supabase
      .from('products')
      .select('*')
      .eq('category', product.category)
      .neq('id', id)
      .limit(3);

    if (relatedError) console.error('Related products error:', relatedError);

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

