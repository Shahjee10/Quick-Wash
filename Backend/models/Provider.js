const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ProviderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactNumber: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  referralCode: { type: String, unique: true },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Create a 2dsphere index for location queries
ProviderSchema.index({ location: '2dsphere' });
ProviderSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('Provider', ProviderSchema);