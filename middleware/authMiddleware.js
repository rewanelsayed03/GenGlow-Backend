const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {

        // Get JWT token from headers
        const token = req.header('Authorization')?.replace('Bearer ', '');

        // Check if token exists
        if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user in the database
        // removes the password field from the returned user object (for security)
        const user = await User.findById(decoded.id).select('-password');

        // User deleted their account but still had a token (deny access).
        if (!user) return res.status(401).json({ error: 'User not found' });

        req.user = user; // attach the full user object
        next();
    } catch (err) {
        console.error('Auth Middleware Error:', err);
        res.status(401).json({ error: 'Token is not valid' });
    }
};

// Allows other files to use it
module.exports = authMiddleware;
