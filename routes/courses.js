const express = require('express');
const router = express.Router();
const {
    getAllCourses,
    getCourseBySlug,
    getCoursePresentations,
    getCourseRecordings,
    getAllPresentations,
    getAllRecordings
} = require('../controllers/courseController');

// Public routes
router.get('/', getAllCourses);
router.get('/presentations/all', getAllPresentations);
router.get('/recordings/all', getAllRecordings);
router.get('/:slug', getCourseBySlug);
router.get('/:id/presentations', getCoursePresentations);
router.get('/:id/recordings', getCourseRecordings);

module.exports = router;
