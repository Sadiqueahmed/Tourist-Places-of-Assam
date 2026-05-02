const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['place', 'product'], default: 'place' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Category', CategorySchema);
