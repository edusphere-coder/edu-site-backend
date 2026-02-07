const express = require('express');
const router = express.Router();
const {
    getRecordingsByCourse,
    createRecording,
    updateRecording,
    deleteRecording
} = require('../controllers/recordingController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication (recordings are protected)
router.use(authenticateToken);

// Get recordings for a course (requires authentication and active account)
router.get('/course/:courseId', getRecordingsByCourse);

// Instructor/Admin routes
router.post('/', createRecording);
router.put('/:id', updateRecording);
router.delete('/:id', deleteRecording);

module.exports = router;
