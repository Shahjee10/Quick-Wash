const User = require('../models/User');
const Provider = require('../models/Provider');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail, verifyEmailCode, generateVerificationCode } = require('../utils/emailVerification'); // Updated to use Mailtrap
const authenticateToken = require('../middlewares/authenticateToken'); // Ensure you have this middleware
const UnverifiedUser = require('../models/UnverifiedUser');

// Register a new customer
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        console.log('Plain-Text Password During Registration:', password);

        // Save the plain-text password in the UnverifiedUser collection
        const unverifiedUser = new UnverifiedUser({
            name,
            email,
            password, // Store as plain text
            verificationCode: generateVerificationCode(),
        });
        await unverifiedUser.save();

        console.log('Temporary User Saved:', unverifiedUser);

        // Send verification email
        await sendVerificationEmail(email, unverifiedUser.verificationCode);
        console.log(`Verification email sent to ${email}`);

        res.status(201).json({ message: 'Registration successful. Please verify your email.' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Server error' });
    }
};



// Verify email
exports.verifyEmail = async (req, res) => {
    try {
        const { email, verificationCode } = req.body;

        const unverifiedUser = await UnverifiedUser.findOne({ email });
        if (!unverifiedUser) {
            return res.status(404).json({ message: 'User not found or already verified.' });
        }

        if (unverifiedUser.verificationCode !== verificationCode) {
            return res.status(400).json({ message: 'Invalid verification code.' });
        }

        console.log('Moving user to the main User collection');
        console.log('Plain-Text Password from UnverifiedUser:', unverifiedUser.password);

        // Hash the password before saving to the User collection
        const hashedPassword = await bcrypt.hash(unverifiedUser.password, 10);
        console.log('Hashed Password:', hashedPassword);

        const user = new User({
            name: unverifiedUser.name,
            email: unverifiedUser.email,
            password: hashedPassword,
            isVerified: true,
        });

        await user.save();
        console.log('Verified User Saved:', user);

        // Remove the user from the UnverifiedUser collection
        await UnverifiedUser.deleteOne({ email });

        res.status(200).json({ message: 'Email verified successfully.' });
    } catch (error) {
        console.error('Error during email verification:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};




// Create user after email verification
exports.createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        const existingUser = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Hash password
        console.log('Plain-Text Password During Registration:', password);
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed Password During Registration:', hashedPassword);

        // Save user
        const user = new User({ name, email, password: hashedPassword });
        console.log('User Saved to Database:', user);
        await user.save();

        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Server error' });
    }
};





// Login a customer
exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        console.log('Login Attempt:', { email, role });

        let user = null;

        // Check the role and fetch the user from the correct collection
        if (role === 'customer') {
            user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
        } else if (role === 'provider') {
            user = await Provider.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
        } else {
            return res.status(400).json({ message: 'Invalid role specified' });
        }

        if (!user) {
            return res.status(400).json({ message: `No ${role} found with this email` });
        }

        // Compare the password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        if (role === 'customer') {
            return res.status(200).json({
                message: 'Login successful',
                token,
                role,
                customer: {
                    name: user.name,
                    email: user.email
                }
            });
        } else if (role === 'provider') {
            return res.status(200).json({
                message: 'Login successful',
                token,
                role,
                provider: {
                    name: user.name,
                    email: user.email
                }
            });
        } else {
            return res.status(200).json({ message: 'Login successful', token, role });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error' });
    }
};




// Fetch user data
exports.getUserData = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ name: user.name, email: user.email });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update user data
exports.updateUserData = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.name = name;
        user.email = email;
        await user.save();
        res.json({ message: 'User data updated successfully' });
    } catch (error) {
        console.error('Error updating user data:', error);
        res.status(500).json({ message: 'Server error' });
    }
};