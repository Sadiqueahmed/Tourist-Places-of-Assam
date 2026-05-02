const mongoose = require('mongoose');

const PlaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  duration: { type: String },
  rating: { type: Number, default: 0 },
  image_url: { type: String },
  featured: { type: Boolean, default: false },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Place', PlaceSchema);
