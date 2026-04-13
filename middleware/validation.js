const { body, validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

/**
 * Validation rules for user registration
 */
const validateRegister = [
    body('first_name')
        .trim()
        .notEmpty()
        .withMessage('First name is required')
        .isLength({ min: 2 })
        .withMessage('First name must be at least 2 characters'),

    body('last_name')
        .trim()
        .notEmpty()
        .withMessage('Last name is required')
        .isLength({ min: 2 })
        .withMessage('Last name must be at least 2 characters'),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),

    body('phone')
        .optional()
        .trim()
        .matches(/^((\+91|0)?\s?-?\s?)?[6-9]\d{9}$/)
        .withMessage('Phone number must be 10 digits and may include +91 or 0 prefix'),

    body('address')
        .optional()
        .trim(),

    handleValidationErrors
];

/**
 * Validation rules for user login
 */
const validateLogin = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),

    handleValidationErrors
];

/**
 * Validation rules for course creation
 */
const validateCourse = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Course title is required')
        .isLength({ min: 3 })
        .withMessage('Title must be at least 3 characters'),

    body('description')
        .optional()
        .trim(),

    body('duration')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Duration must be a positive number'),

    body('level')
        .optional()
        .isIn(['beginner', 'intermediate', 'advanced'])
        .withMessage('Level must be beginner, intermediate, or advanced'),

    handleValidationErrors
];

/**
 * Validation rules for profile update
 */
const validateProfileUpdate = [
    body('first_name')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('First name must be at least 2 characters'),

    body('last_name')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Last name must be at least 2 characters'),

    body('phone')
        .optional()
        .trim()
        .matches(/^[0-9]{10}$/)
        .withMessage('Phone number must be 10 digits'),

    body('address')
        .optional()
        .trim(),

    handleValidationErrors
];

module.exports = {
    validateRegister,
    validateLogin,
    validateCourse,
    validateProfileUpdate
};
