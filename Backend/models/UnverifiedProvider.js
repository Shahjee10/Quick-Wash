const mongoose = require('mongoose');

const UnverifiedProviderSchema = new mongoose.Schema({
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
  referralCode: { type: String }, // Add referralCode field (optional)
  verificationCode: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UnverifiedProvider', UnverifiedProviderSchema);