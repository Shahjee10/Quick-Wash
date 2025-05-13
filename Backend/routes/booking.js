const express = require('express');
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  updateBookingStatus,
  getAcceptedBookings,
  getPendingBookings,
  getRejectedBookings,
  getProviderAcceptedBookings,
  assignTask,
  getEmployeeAssignedBookings,
  completeTask,
  getEmployeeCompletedTasks,
  markNotificationAsRead,
  getNotifications
} = require('../Controllers/bookingController');

// Correctly import middlewares
const { authMiddleware, employeeAuth } = require('../middlewares/authMiddleware');

// Employee routes
router.post('/complete-task', employeeAuth, completeTask);
router.get('/employee-completed-tasks', employeeAuth, getEmployeeCompletedTasks);
router.get('/employee-assigned-bookings', employeeAuth, getEmployeeAssignedBookings);

// Provider routes
router.post('/notifications/mark-read', authMiddleware, markNotificationAsRead);
router.get('/provider-accepted-bookings', authMiddleware, getProviderAcceptedBookings);
router.post('/assign-task', authMiddleware, assignTask);
router.get('/booking-requests', authMiddleware, getAllBookings);
router.post('/booking-status', authMiddleware, updateBookingStatus);
router.get('/accepted-bookings', authMiddleware, getAcceptedBookings);
router.get('/pending-bookings', authMiddleware, getPendingBookings);
router.get('/rejected-bookings', authMiddleware, getRejectedBookings);

// Customer routes
router.post('/create', authMiddleware, createBooking);

// Get notifications
router.get('/notifications', authMiddleware, getNotifications);

module.exports = router;
