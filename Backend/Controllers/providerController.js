const Provider = require('../models/Provider');
const UnverifiedProvider = require('../models/UnverifiedProvider');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail, generateVerificationCode } = require('../utils/emailVerification');
const UnverifiedEmployee = require('../models/UnverifiedEmployee');
const Employee = require('../models/Employee');

// Register a new provider
exports.register = async (req, res) => {
  try {
    const { name, email, password, contactNumber, city, address, location, referralCode } = req.body;

    if (!name || !email || !password || !contactNumber || !city || !address || !location) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email already exists
    const existingProvider = await Provider.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (existingProvider) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create location object
    const locationData = {
      type: 'Point',
      coordinates: [location.longitude, location.latitude]
    };

    // Save the plain-text password in the UnverifiedProvider collection
    const unverifiedProvider = new UnverifiedProvider({
      name,
      email,
      password,
      contactNumber,
      city,
      address,
      location: locationData,
      referralCode,
      verificationCode: generateVerificationCode(),
    });

    await unverifiedProvider.save();
    console.log('Temporary Provider Saved:', unverifiedProvider);

    // Send verification email
    await sendVerificationEmail(email, unverifiedProvider.verificationCode);
    console.log(`Verification email sent to ${email}`);

    res.status(201).json({ message: 'Registration successful. Please verify your email.' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify email and create provider account
exports.verifyEmail = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    // Find the unverified provider
    const unverifiedProvider = await UnverifiedProvider.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') },
      verificationCode 
    });

    if (!unverifiedProvider) {
      return res.status(400).json({ message: 'Invalid verification code or email' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(unverifiedProvider.password, salt);

    // Create new provider with hashed password
    const provider = new Provider({
      name: unverifiedProvider.name,
      email: unverifiedProvider.email,
      password: hashedPassword,
      contactNumber: unverifiedProvider.contactNumber,
      city: unverifiedProvider.city,
      address: unverifiedProvider.address,
      location: unverifiedProvider.location,
      referralCode: unverifiedProvider.referralCode,
      isVerified: true
    });

    await provider.save();

    // Delete the unverified provider
    await UnverifiedProvider.deleteOne({ _id: unverifiedProvider._id });

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error during email verification:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create provider after email verification
exports.createProvider = async (req, res) => {
  try {
    const { name, email, password, contactNumber, city, address, referralCode } = req.body;

    if (!name || !email || !password || !contactNumber || !city || !address) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingProvider = await Provider.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (existingProvider) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash password
    console.log('Plain-Text Password During Registration:', password);
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed Password During Registration:', hashedPassword);

    // Save provider
    const provider = new Provider({
      name,
      email,
      password: hashedPassword,
      contactNumber,
      city,
      address,
      referralCode, // Include referralCode
    });

    await provider.save();
    console.log('Provider Saved to Database:', provider);

    res.status(201).json({ message: 'Provider registered successfully.' });
  } catch (error) {
    console.error('Error during provider creation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login a provider
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    console.log('Login Attempt:', { email, password });

    const provider = await Provider.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (!provider) {
      console.log('Provider not found for email:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log('Stored Hashed Password:', provider.password);

    // Compare the password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, provider.password);
    console.log('Password Match Status:', isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: provider._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Fetch provider data
exports.getProviderData = async (req, res) => {
  try {
    const provider = await Provider.findById(req.user.id);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.json({
      name: provider.name,
      email: provider.email,
      contactNumber: provider.contactNumber,
      city: provider.city,
      address: provider.address,
      referralCode: provider.referralCode, // Include referralCode in response
    });
  } catch (error) {
    console.error('Error fetching provider data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update provider data
exports.updateProviderData = async (req, res) => {
  try {
    const { name, contactNumber, city, address, referralCode } = req.body; // Include referralCode
    const provider = await Provider.findById(req.user.id);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    provider.name = name || provider.name;
    provider.contactNumber = contactNumber || provider.contactNumber;
    provider.city = city || provider.city;
    provider.address = address || provider.address;
    provider.referralCode = referralCode || provider.referralCode; // Update referralCode if provided
    await provider.save();
    res.json({ message: 'Provider data updated successfully' });
  } catch (error) {
    console.error('Error updating provider data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.approveEmployee = async (req, res) => {
  try {
    const { unverifiedEmployeeId } = req.body;

    const unverifiedEmployee = await UnverifiedEmployee.findById(unverifiedEmployeeId);

    if (!unverifiedEmployee) {
      return res.status(404).json({ message: 'Unverified employee not found' });
    }

    const newEmployee = new Employee({
      name: unverifiedEmployee.name,
      cnic: unverifiedEmployee.cnic,
      providerId: unverifiedEmployee.providerId,
    });

    await newEmployee.save();

    await UnverifiedEmployee.findByIdAndDelete(unverifiedEmployeeId);

    res.status(201).json({ message: 'Employee approved successfully' });
  } catch (error) {
    console.error('Approval Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Fetch all provider locations
exports.getAllProviderLocations = async (req, res) => {
  try {
    const providers = await Provider.find(
      { isVerified: true },
      'name address location contactNumber city'
    );

    res.json({ providers });
  } catch (error) {
    console.error('Error fetching provider locations:', error);
    res.status(500).json({ message: 'Error fetching provider locations' });
  }
};

// Check if email exists
exports.checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check in both Provider and UnverifiedProvider collections
    const [existingProvider, existingUnverifiedProvider] = await Promise.all([
      Provider.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } }),
      UnverifiedProvider.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } })
    ]);

    const exists = !!(existingProvider || existingUnverifiedProvider);
    
    res.json({ exists });
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
