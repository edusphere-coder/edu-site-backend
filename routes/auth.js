const express = require('express');
const router = express.Router();
const { register, login, googleSignIn, getProfile, updateProfile } = require('../controllers/authController');
const { validateRegister, validateLogin, validateProfileUpdate } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// Accept both snake_case and camelCase payloads from clients.
const normalizeAuthPayload = (req, res, next) => {
	if (req.body && typeof req.body === 'object') {
		if (req.body.first_name === undefined && req.body.firstName !== undefined) {
			req.body.first_name = req.body.firstName;
		}
		if (req.body.last_name === undefined && req.body.lastName !== undefined) {
			req.body.last_name = req.body.lastName;
		}
		if (req.body.id_token === undefined && req.body.idToken !== undefined) {
			req.body.id_token = req.body.idToken;
		}
	}
	next();
};

// Public routes
router.post('/register', normalizeAuthPayload, validateRegister, register);
router.post('/login', normalizeAuthPayload, validateLogin, login);
router.post('/google', normalizeAuthPayload, googleSignIn);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, normalizeAuthPayload, validateProfileUpdate, updateProfile);

module.exports = router;
