const Course = require('../models/Course');

/**
 * Get all courses
 */
const getAllCourses = async (req, res, next) => {
    try {
        const courses = await Course.getAll();

        res.json({
            success: true,
            data: { courses }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get course by slug
 */
const getCourseBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const course = await Course.getBySlug(slug);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.json({
            success: true,
            data: { course }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get presentations for a course
 */
const getCoursePresentations = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Verify course exists
        const course = await Course.getById(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        const presentations = await Course.getPresentations(id);

        res.json({
            success: true,
            data: { presentations }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get recordings for a course
 */
const getCourseRecordings = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Verify course exists
        const course = await Course.getById(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        const recordings = await Course.getRecordings(id);

        res.json({
            success: true,
            data: { recordings }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all presentations
 */
const getAllPresentations = async (req, res, next) => {
    try {
        const presentations = await Course.getAllPresentations();

        res.json({
            success: true,
            data: { presentations }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all recordings
 */
const getAllRecordings = async (req, res, next) => {
    try {
        const recordings = await Course.getAllRecordings();

        res.json({
            success: true,
            data: { recordings }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllCourses,
    getCourseBySlug,
    getCoursePresentations,
    getCourseRecordings,
    getAllPresentations,
    getAllRecordings
};
