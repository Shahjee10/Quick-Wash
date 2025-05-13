// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Provider = require('../models/Provider');

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists
    const user = await User.findById(decoded.id);
    if (user) {
      req.user = user;
      return next();
    }

    // If not a user, check if it's a provider
    const provider = await Provider.findById(decoded.id);
    if (provider) {
      req.user = provider;
      return next();
    }

    return res.status(401).json({ message: 'User not found or token invalid' });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { isAuthenticated };
