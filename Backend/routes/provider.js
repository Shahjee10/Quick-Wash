const express = require('express');
const router = express.Router();
const providerController = require('../Controllers/providerController');
const authenticateToken = require('../middlewares/authenticateToken');
const { approveEmployee } = require('../Controllers/providerController');

// Add provider-specific routes
router.post('/approve-employee', approveEmployee);
router.post('/register', providerController.register);
router.post('/verifyemail', providerController.verifyEmail);
router.post('/login', providerController.login);
router.post('/check-email', providerController.checkEmail);

// New endpoints for provider account data
router.get('/me',authenticateToken, providerController.getProviderData); // Get provider account details
router.put('/update',authenticateToken, providerController.updateProviderData); // Update provider account details
router.get('/locations', authenticateToken, providerController.getAllProviderLocations); // Get all provider locations

module.exports = router;
