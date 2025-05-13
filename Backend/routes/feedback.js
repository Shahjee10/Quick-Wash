const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// Submit feedback
router.post('/', async (req, res) => {
  try {
    const { name, comment, stars } = req.body;

    // Validate required fields
    if (!name || !comment || !stars) {
      return res.status(400).json({ 
        message: 'All fields (name, comment, stars) are required' 
      });
    }

    // Validate stars is a number between 1 and 5
    if (typeof stars !== 'number' || stars < 1 || stars > 5) {
      return res.status(400).json({ 
        message: 'Stars must be a number between 1 and 5' 
      });
    }

    const feedback = new Feedback({
      name,
      comment,
      stars
    });

    await feedback.save();
    res.status(201).json(feedback);
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get all feedbacks
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 