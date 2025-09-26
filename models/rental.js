// const mongoose = require('mongoose');

// const rentalSchema = new mongoose.Schema({
//   itemId: mongoose.Schema.Types.ObjectId,
//   renterId: mongoose.Schema.Types.ObjectId,
//   ownerId: mongoose.Schema.Types.ObjectId,
//   startDate: Date,
//   endDate: Date,
//   status: String, // 'requested', 'accepted', 'completed'
//   prePhotos: [String],
//   postPhotos: [String],
//   reviewByOwner: Number,
//   reviewByRenter: Number
// });

// module.exports = mongoose.model('Rental', rentalSchema);



const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  renterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startDate: Date,
  endDate: Date,
  status: { type: String, enum: ['requested', 'approved', 'declined', 'returned'], default: 'requested' },
});

module.exports = mongoose.model('Rental', rentalSchema);
