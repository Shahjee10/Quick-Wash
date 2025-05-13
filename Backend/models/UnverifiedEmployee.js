const mongoose = require('mongoose');

const unverifiedEmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cnic: { type: String, required: true },
  referralCode: { type: String, required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  status: { type: String, default: 'pending' }, // 'pending', 'verified', or 'rejected'
});

module.exports = mongoose.model('UnverifiedEmployee', unverifiedEmployeeSchema);