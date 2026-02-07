const express = require('express');
const router = express.Router();
const {
    enrollInCourse,
    getMyEnrollments,
    getCourseEnrollments,
    updateProgress,
    unenrollFromCourse
} = require('../controllers/enrollmentController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Student routes
router.post('/:courseId', enrollInCourse);
router.get('/my/enrollments', getMyEnrollments);
router.put('/:courseId/progress', updateProgress);
router.delete('/:courseId', unenrollFromCourse);

// Instructor/Admin routes
router.get('/course/:courseId', requireRole('instructor', 'admin'), getCourseEnrollments);

module.exports = router;
