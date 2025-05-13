const express = require('express');
const router = express.Router();
const {
  registerEmployee,
  getUnverifiedEmployees,
  verifyEmployee,
  getEmployeesByProvider,
  loginEmployee,
  getEmployeeProfile,
  updateEmployeeProfile,
} = require('../controllers/employeeController');
const auth = require('../../Backend/middlewares/authenticateToken');

// Register employee
router.post('/register', registerEmployee);

// Fetch unverified employees
router.get('/unverified', getUnverifiedEmployees);

// Verify or reject employee
router.post('/verify', verifyEmployee);

// Fetch employees by providerId (requires authentication)
router.get('/provider-employees', auth, getEmployeesByProvider);

// Employee login
router.post('/login', loginEmployee);

// Get employee profile (requires authentication)
router.get('/profile/:id', auth, getEmployeeProfile);

// Update employee profile (requires authentication)
router.put('/profile/:id', auth, updateEmployeeProfile);

module.exports = router;
