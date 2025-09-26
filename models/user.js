// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   phone: String,
//   kycVerified: Boolean,
//   trustFactor: { type: Number, default: 0 },
//   deposit: { type: Number, default: 0 },
//   wallet: { type: Number, default: 0 },
//   userType: String // 'renter' or 'owner'
// });

// module.exports = mongoose.model('User', userSchema);





const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  userType: { type: String, enum: ['renter', 'owner'], required: true },
  deposit: { type: Number, default: 0 },
  wallet: { type: Number, default: 0 },
  trustFactor: { type: Number, default: 0 },
});

module.exports = mongoose.model('User', userSchema);
