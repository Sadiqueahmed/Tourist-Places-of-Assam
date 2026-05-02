const mongoose = require('mongoose');

const AdventureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  image_url: { type: String },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Adventure', AdventureSchema);
