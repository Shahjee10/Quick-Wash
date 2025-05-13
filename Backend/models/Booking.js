const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    service: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    vehicle: {
      type: String,
      required: true,
    },
    vehicleModel: {
      type: String,
      required: true,
    },
    preferences: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Completed'],
      default: 'Pending',
    },
    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null, // Tracks the employee assigned to this booking
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);