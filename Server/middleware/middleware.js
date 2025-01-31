const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Verify JWT token middleware
const verifyToken = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if user exists and is active
        const { rows } = await pool.query(
            'SELECT user_id, username, email, full_name, is_active FROM users WHERE user_id = $1 AND deleted_at IS NULL',
            [decoded.user_id]
        );

        if (!rows.length || !rows[0].is_active) {
            return res.status(401).json({ message: 'User not found or inactive' });
        }

        // Attach user to request object
        req.user = rows[0];
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Optional auth middleware - allows both authenticated and non-authenticated requests
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const { rows } = await pool.query(
            'SELECT user_id, username, email, full_name, is_active FROM users WHERE user_id = $1 AND deleted_at IS NULL',
            [decoded.user_id]
        );

        if (rows.length && rows[0].is_active) {
            req.user = rows[0];
        }
        next();

    } catch (error) {
        next();
    }
};

module.exports = {
    verifyToken,
    optionalAuth
};