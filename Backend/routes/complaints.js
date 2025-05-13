const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { isAuthenticated } = require('../middlewares/auth');

// Create a new complaint
router.post('/create', isAuthenticated, async (req, res) => {
  try {
    const { title, description, serviceType, dateOfService } = req.body;

    const complaint = new Complaint({
      title,
      description,
      serviceType,
      dateOfService,
      customer: req.user.id,
      status: 'Pending'
    });

    await complaint.save();
    res.status(201).json(complaint);
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ message: 'Error creating complaint' });
  }
});

// Get all complaints for provider dashboard
router.get('/provider', isAuthenticated, async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(complaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ message: 'Error fetching complaints' });
  }
});

// Update complaint status
router.put('/:id/status', isAuthenticated, async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.status = status;
    await complaint.save();

    res.json(complaint);
  } catch (error) {
    console.error('Error updating complaint status:', error);
    res.status(500).json({ message: 'Error updating complaint status' });
  }
});

module.exports = router; 