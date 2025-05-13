const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const authenticateToken = require('../middlewares/authenticateToken');

router.post('/register', authController.register);
router.post('/verify-email', authController.verifyEmail);
router.post('/create-user', authController.createUser);
router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.getUserData);
router.put('/update', authenticateToken, authController.updateUserData);

module.exports = router;