const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select('-password');
        if (!user) return res.status(401).json({ error: 'User not found' });

        req.user = user; // attach the full user object
        next();
    } catch (err) {
        console.error('Auth Middleware Error:', err);
        res.status(401).json({ error: 'Token is not valid' });
    }
};

module.exports = authMiddleware;
