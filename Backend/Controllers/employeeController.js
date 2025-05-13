const UnverifiedEmployee = require('../models/UnverifiedEmployee');
const Employee = require('../models/Employee');
const Provider = require('../models/Provider');
const jwt = require('jsonwebtoken');

// Register new employee (unverified)
const registerEmployee = async (req, res) => {
  try {
    const { name, cnic, referralCode } = req.body;

    const provider = await Provider.findOne({ referralCode });
    if (!provider) {
      return res.status(404).json({ message: 'Invalid referral code' });
    }

    const newUnverifiedEmployee = new UnverifiedEmployee({
      name,
      cnic,
      referralCode,
      providerId: provider._id,
    });

    await newUnverifiedEmployee.save();
    res.status(201).json({ message: 'Employee registered and waiting for provider approval' });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all unverified employees
const getUnverifiedEmployees = async (req, res) => {
  try {
    const unverifiedEmployees = await UnverifiedEmployee.find({ status: 'pending' });
    res.status(200).json({ unverifiedEmployees });
  } catch (error) {
    console.error('Error fetching unverified employees:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify or reject unverified employee
const verifyEmployee = async (req, res) => {
  const { employeeId, action } = req.body;

  if (!employeeId || !action) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  try {
    const employee = await UnverifiedEmployee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (action === 'accept') {
      const provider = await Provider.findById(employee.providerId);
      if (!provider) {
        return res.status(404).json({ message: 'Provider not found' });
      }

      const newEmployee = new Employee({
        name: employee.name,
        normalizedName: employee.name.trim().toLowerCase(),
        cnic: employee.cnic,
        providerId: employee.providerId,
        referralCode: provider.referralCode,
      });
      await newEmployee.save();
      await UnverifiedEmployee.findByIdAndDelete(employeeId);
      return res.status(200).json({ message: 'Employee verified and added to Employee table' });
    } else if (action === 'reject') {
      await UnverifiedEmployee.findByIdAndDelete(employeeId);
      return res.status(200).json({ message: 'Employee rejected' });
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error verifying/rejecting employee:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get employees of a specific provider
const getEmployeesByProvider = async (req, res) => {
  try {
    const providerId = req.user.id; // Assuming req.user.id is set by auth middleware
    const employees = await Employee.find({ providerId });
    res.status(200).json({ employees });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Employee login
const loginEmployee = async (req, res) => {
  try {
    const { name, referralCode } = req.body;

    if (!name || !referralCode) {
      return res.status(400).json({ message: 'Name and referral code are required' });
    }

    // Trim and normalize the name
    const normalizedName = name.trim().toLowerCase();

    // Find employee with case-insensitive name match
    const employee = await Employee.findOne({
      name: { $regex: new RegExp(`^${normalizedName}$`, 'i') }
    }).populate('providerId');

    console.log('Searching for employee with name:', normalizedName);
    console.log('Found employee:', employee);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if the referral code matches
    if (employee.referralCode !== referralCode) {
      console.log('Referral code mismatch:', {
        provided: referralCode,
        stored: employee.referralCode
      });
      return res.status(401).json({ message: 'Invalid referral code' });
    }

    const token = jwt.sign(
      { _id: employee._id.toString(), role: 'employee' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    employee.tokens = employee.tokens.concat({ token });
    await employee.save();

    res.status(200).json({
      message: 'Login successful',
      token,
      role: 'employee',
      employee: {
        id: employee._id,
        name: employee.name,
        providerId: employee.providerId._id,
      },
    });
  } catch (error) {
    console.error('Error during employee login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get employee profile
const getEmployeeProfile = async (req, res) => {
  try {
    const employeeId = req.params.id;
    
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }

    const employee = await Employee.findById(employeeId)
      .select('name cnic referralCode')
      .lean();

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.status(200).json({
      success: true,
      employee
    });
  } catch (error) {
    console.error('Error in getEmployeeProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update employee profile
const updateEmployeeProfile = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const { name, cnic } = req.body;

    // Validate input
    if (!name || !cnic) {
      return res.status(400).json({
        success: false,
        message: 'Name and CNIC are required'
      });
    }

    // Validate CNIC format (assuming Pakistani CNIC format)
    const cnicRegex = /^\d{13}$/;
    if (!cnicRegex.test(cnic)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid CNIC format. Please enter 13 digits without dashes'
      });
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeId,
      {
        name,
        cnic,
        normalizedName: name.trim().toLowerCase()
      },
      { new: true }
    ).select('name cnic referralCode');

    if (!updatedEmployee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      employee: updatedEmployee
    });
  } catch (error) {
    console.error('Error in updateEmployeeProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  registerEmployee,
  getUnverifiedEmployees,
  verifyEmployee,
  getEmployeesByProvider,
  loginEmployee,
  getEmployeeProfile,
  updateEmployeeProfile
};
