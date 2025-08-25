const jwt = require('jsonwebtoken');
const userModel = require('../models/userModels');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication token is required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user is blocked
        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been blocked. Please contact the administrator.'
            });
        }

        // Role-based access control
        const path = req.path;
        if (path.startsWith('/doctor/') && !user.isDoctor) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Doctor privileges required.'
            });
        }

        if (path.startsWith('/admin/') && !user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired. Please login again.'
            });
        }
        return res.status(401).json({
            success: false,
            message: 'Invalid authentication token'
        });
    }
};

module.exports = authMiddleware;
