const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided, authorization denied'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
        }

        req.user = user;
        next();

    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({
            success: false,
            message: 'Token is not valid'
        });
    }
};

// Admin-only middleware
const adminMiddleware = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error in authorization'
        });
    }
};

// Permission-based middleware factory
const requirePermission = (permission) => {
    return async (req, res, next) => {
        try {
            if (!req.user.hasPermission(permission)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. ${permission} permission required.`
                });
            }
            next();
        } catch (error) {
            console.error('Permission middleware error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error in permission check'
            });
        }
    };
};

module.exports = {
    authMiddleware,
    adminMiddleware,
    requirePermission
};
