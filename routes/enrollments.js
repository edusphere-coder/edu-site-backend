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
const { validateEnrollmentAccessCode } = require('../middleware/validation');

const normalizeEnrollmentPayload = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        if (req.body.access_code === undefined && req.body.accessCode !== undefined) {
            req.body.access_code = req.body.accessCode;
        }
    }

    next();
};

// All routes require authentication
router.use(authenticateToken);

// Student routes
router.post('/:courseId', normalizeEnrollmentPayload, validateEnrollmentAccessCode, enrollInCourse);
router.get('/my/enrollments', getMyEnrollments);
router.put('/:courseId/progress', updateProgress);
router.delete('/:courseId', unenrollFromCourse);

// Instructor/Admin routes
router.get('/course/:courseId', requireRole('instructor', 'admin'), getCourseEnrollments);

module.exports = router;
