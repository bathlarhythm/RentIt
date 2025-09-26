const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  value: Number,
  rentPrice: { type: Number, required: true },  // ✅ add this
  category: String,                             // optional
  city: String,                                 // optional
  image: String,                                // optional
  available: { type: Boolean, default: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Item', itemSchema);
