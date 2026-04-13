const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Sign in with Google
 */
const googleSignIn = async (req, res, next) => {
    try {
        const { id_token } = req.body;

        if (!id_token) {
            return res.status(400).json({
                success: false,
                message: 'Google id_token is required.'
            });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const email = payload?.email;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Google token payload.'
            });
        }

        let user = await User.findByEmail(email);

        if (!user) {
            const randomPassword = crypto.randomBytes(32).toString('hex');
            const userId = await User.create({
                first_name: payload.given_name || 'Google',
                last_name: payload.family_name || 'User',
                email,
                password: randomPassword,
                phone: null,
                address: null,
                role: 'student'
            });
            user = await User.findById(userId);
        }

        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role
        });

        res.json({
            success: true,
            message: 'Google login successful',
            data: {
                user,
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Register a new user
 */
const register = async (req, res, next) => {
    try {
        const { first_name, last_name, email, password, phone, address, role } = req.body;

        // Validate role (only allow student or instructor, not admin)
        if (role && !['student', 'instructor'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Only "student" or "instructor" are allowed.'
            });
        }

        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create user
        const userId = await User.create({
            first_name,
            last_name,
            email,
            password,
            phone,
            address,
            role: role || 'student' // Default to student if not provided
        });

        // Get created user (without password)
        const user = await User.findById(userId);

        res.status(201).json({
            success: true,
            message: 'Registration successful! You can now log in to your account.',
            data: { user }
        });
    } catch (error) {
        next(error);
        
    }
};

/**
 * Login user
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Verify password
        const isValidPassword = await User.verifyPassword(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if user account is active
        // if (!user.is_active) {
        //     return res.status(403).json({
        //         success: false,
        //         message: 'Your account is pending activation. Please contact the admin team for access.'
        //     });
        // }

        // Generate token
        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role
        });

        // Remove password from response
        delete user.password;

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user,
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user profile
 */
const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res, next) => {
    try {
        const { first_name, last_name, phone, address } = req.body;

        const updated = await User.update(req.user.id, {
            first_name,
            last_name,
            phone,
            address
        });

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = await User.findById(req.user.id);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    googleSignIn,
    getProfile,
    updateProfile
};
