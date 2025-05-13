const jwt = require('jsonwebtoken');

// For general user authentication
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // decoded = { id, role }
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// For employee-specific authentication
const employeeAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Set both user and employee for compatibility
        req.user = { 
            id: decoded._id, // Map _id to id
            role: decoded.role
        };
        req.employee = req.user; // For backward compatibility
        next();
    } catch (error) {
        console.error('Employee Authentication error:', error.message);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = { authMiddleware, employeeAuth };
