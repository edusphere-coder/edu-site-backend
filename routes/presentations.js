const express = require('express');
const router = express.Router();
const {
    getPresentationsByCourse,
    createPresentation,
    updatePresentation,
    deletePresentation
} = require('../controllers/presentationController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get presentations for a course (requires enrollment)
router.get('/course/:courseId', getPresentationsByCourse);

// Instructor/Admin routes
router.post('/', requireRole('instructor', 'admin'), createPresentation);
router.put('/:id', requireRole('instructor', 'admin'), updatePresentation);
router.delete('/:id', requireRole('instructor', 'admin'), deletePresentation);

module.exports = router;
