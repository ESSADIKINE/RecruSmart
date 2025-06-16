const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        // Check for authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false,
                message: 'Authentication token is required' 
            });
        }

        // Extract and verify token
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check token expiration
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
            return res.status(401).json({ 
                success: false,
                message: 'Token has expired' 
            });
        }

        // Find user and check if active
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        if (!user.isActiveUser()) {
            return res.status(403).json({ 
                success: false,
                message: 'User account is inactive' 
            });
        }

        // Update last login
        await user.updateLastLogin();

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid token' 
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token has expired' 
            });
        }
        console.error('Auth middleware error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

module.exports = authMiddleware; 