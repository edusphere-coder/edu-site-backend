const User = require('../models/User');

/**
 * Get all inactive users
 */
const getInactiveUsers = async (req, res, next) => {
    try {
        const users = await User.getAllInactive();

        res.json({
            success: true,
            data: {
                users,
                count: users.length
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all users
 */
const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.getAll();

        res.json({
            success: true,
            data: {
                users,
                count: users.length
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Activate a user
 */
const activateUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        const updated = await User.updateActiveStatus(id, true);

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = await User.findById(id);

        res.json({
            success: true,
            message: 'User activated successfully',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Deactivate a user
 */
const deactivateUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        const updated = await User.updateActiveStatus(id, false);

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = await User.findById(id);

        res.json({
            success: true,
            message: 'User deactivated successfully',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getInactiveUsers,
    getAllUsers,
    activateUser,
    deactivateUser
};
