const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String},
  password: String,
  userType: { type: String, enum: ['renter', 'owner'], required: true },
  deposit: { type: Number, default: 0 },
  wallet: { type: Number, default: 0 },
  trustFactor: { type: Number, default: 0 },
 
});
userSchema.index({ email: 1, userType: 1 }, { unique: true });
module.exports = mongoose.model('User', userSchema);
