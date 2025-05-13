const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  normalizedName: { type: String, required: true },
  cnic: { type: String, required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  referralCode: { type: String, required: true },
  tokens: [{ token: { type: String, required: true } }], // ✅ Added tokens array
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Employee', employeeSchema);
