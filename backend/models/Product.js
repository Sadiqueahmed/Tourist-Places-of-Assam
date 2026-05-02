const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number },
  image_url: { type: String },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
