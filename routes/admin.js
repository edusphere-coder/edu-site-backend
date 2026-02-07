const express = require('express');
const router = express.Router();
const { getInactiveUsers, getAllUsers, activateUser, deactivateUser } = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');

// Middleware to check if user is admin
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
    next();
};

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(adminOnly);

// Get all users
router.get('/users', getAllUsers);

// Get all inactive users
router.get('/users/inactive', getInactiveUsers);

// Activate a user
router.put('/users/:id/activate', activateUser);

// Deactivate a user
router.put('/users/:id/deactivate', deactivateUser);

module.exports = router;
