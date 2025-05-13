const Booking = require('../models/Booking');
const mongoose = require('mongoose'); // make sure mongoose is imported
const Employee = require('../models/Employee'); // Import Employee model at top
const Notification = require('../models/Notification'); // Import Notification model at top
// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { service, price, address, vehicle, vehicleModel, preferences } = req.body;

    if (!service || !price || !address || !vehicle || !vehicleModel) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newBooking = new Booking({
      user: req.user.id,
      service,
      price,
      address,
      vehicle,
      vehicleModel,
      preferences,
    });

    await newBooking.save();

    res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all bookings (Admin or Provider View)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user', 'name email');
    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update booking status (Accept/Reject)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;
    const providerId = req.user.id;

    if (!['Accepted', 'Rejected', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    if (status === 'Accepted') {
      booking.provider = providerId;
    }

    await booking.save();

    res.status(200).json({ message: `Booking ${status.toLowerCase()} successfully`, booking });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get provider's accepted bookings
exports.getProviderAcceptedBookings = async (req, res) => {
  try {
    const providerId = req.user.id;
    const bookings = await Booking.find({ status: 'Accepted', provider: providerId })
      .populate('user', 'name email')
      .populate('assignedEmployee', 'name'); // Populate assignedEmployee with name
    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error fetching provider accepted bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get accepted bookings for a user
exports.getAcceptedBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ user: userId, status: 'Accepted' });
    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error fetching accepted bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get pending bookings
exports.getPendingBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: 'Pending' }).populate('user', 'name email');
    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error fetching pending bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get rejected bookings
exports.getRejectedBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ status: 'Rejected', user: userId }).populate('user', 'name email');
    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error fetching rejected bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// New function: Assign task to employee
exports.assignTask = async (req, res) => {
  try {
    const { bookingId, employeeId } = req.body;
    const providerId = req.user.id;

    if (!bookingId || !employeeId) {
      return res.status(400).json({ message: 'Booking ID and Employee ID are required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Ensure the booking belongs to the provider
    if (booking.provider.toString() !== providerId) {
      return res.status(403).json({ message: 'Unauthorized: Booking does not belong to this provider' });
    }

    const employee = await require('../models/Employee').findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Ensure the employee belongs to the provider
    if (employee.providerId.toString() !== providerId) {
      return res.status(403).json({ message: 'Unauthorized: Employee does not belong to this provider' });
    }

    booking.assignedEmployee = employeeId;
    await booking.save();

    res.status(200).json({ message: 'Task assigned successfully', booking });
  } catch (error) {
    console.error('Error assigning task:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEmployeeAssignedBookings = async (req, res) => {
  try {
    // Get employee ID from either source
    const employeeId = req.user?.id || req.user?._id || req.employee?._id;
    
    if (!employeeId) {
      console.error('No employee ID found in request:', { user: req.user, employee: req.employee });
      return res.status(401).json({ message: 'Employee ID not found' });
    }

    console.log('Fetching bookings for employee:', employeeId);

    const bookings = await Booking.find({
      assignedEmployee: employeeId,
      status: 'Accepted' // Only get active (Accepted) bookings
    }).populate('user', 'name email')
      .populate('provider', 'name');

    console.log('Found bookings:', bookings);

    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error fetching employee bookings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Complete task endpoint
exports.completeTask = async (req, res) => {
  try {
    console.log('Received complete task request:', req.body);
    const { bookingId, employeeId } = req.body;

    if (!bookingId || !employeeId) {
      console.log('Missing required fields:', { bookingId, employeeId });
      return res.status(400).json({ message: 'Booking ID and Employee ID are required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.log('Booking not found:', bookingId);
      return res.status(404).json({ message: 'Booking not found' });
    }

    console.log('Found booking:', booking);
    console.log('Comparing employee IDs:', {
      assignedEmployee: booking.assignedEmployee?.toString(),
      requestingEmployee: employeeId
    });

    // Verify the employee is assigned to this booking
    if (!booking.assignedEmployee || booking.assignedEmployee.toString() !== employeeId) {
      return res.status(403).json({ 
        message: 'Unauthorized: Employee not assigned to this booking',
        assignedEmployee: booking.assignedEmployee?.toString(),
        requestingEmployee: employeeId
      });
    }

    // Update booking status to completed
    booking.status = 'Completed';
    await booking.save();
    console.log('Booking marked as completed');

    // Create notification for provider
    try {
      const providerNotification = new Notification({
        recipient: booking.provider,
        type: 'TASK_COMPLETED',
        bookingId: bookingId,
        message: `Task for ${booking.service} has been completed`,
        read: false
      });
      await providerNotification.save();
      console.log('Provider notification created');

      // Create notification for customer
      const customerNotification = new Notification({
        recipient: booking.user,
        type: 'SERVICE_COMPLETED',
        bookingId: bookingId,
        message: `Your ${booking.service} service has been completed`,
        read: false
      });
      await customerNotification.save();
      console.log('Customer notification created');
    } catch (notificationError) {
      console.error('Error creating notifications:', notificationError);
      // Don't fail the whole request if notification fails
    }

    res.status(200).json({ 
      message: 'Task completed successfully',
      booking 
    });
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Get completed tasks for employee
exports.getEmployeeCompletedTasks = async (req, res) => {
  try {
    const employeeId = req.user?.id || req.user?._id;
    
    if (!employeeId) {
      return res.status(401).json({ message: 'Employee ID not found' });
    }

    const completedBookings = await Booking.find({
      assignedEmployee: employeeId,
      status: 'Completed'
    })
    .populate('user', 'name email')
    .populate('provider', 'name')
    .sort({ updatedAt: -1 }); // Most recent first

    res.status(200).json({ bookings: completedBookings });
  } catch (error) {
    console.error('Error fetching completed tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark provider notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.body;
    const providerId = req.user.id;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.recipient.toString() !== providerId) {
      return res.status(403).json({ message: 'Unauthorized: Not your notification' });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User ID not found' });
    }

    const notifications = await Notification.find({
      recipient: userId
    })
    .populate('bookingId', 'service')
    .sort({ createdAt: -1 }); // Most recent first

    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};