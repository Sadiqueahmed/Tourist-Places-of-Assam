const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  comment: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  place_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Place' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', ReviewSchema);
