const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

/**
 * Enroll in a course
 */
const enrollInCourse = async (req, res, next) => {
    try {
        const { courseId } = req.params;

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if already enrolled
        const isEnrolled = await Enrollment.isEnrolled(req.user.id, courseId);
        if (isEnrolled) {
            return res.status(409).json({
                success: false,
                message: 'You are already enrolled in this course'
            });
        }

        // Enroll user
        await Enrollment.create(req.user.id, courseId);

        res.status(201).json({
            success: true,
            message: 'Successfully enrolled in course'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user's enrollments
 */
const getMyEnrollments = async (req, res, next) => {
    try {
        const enrollments = await Enrollment.getByUser(req.user.id);

        res.json({
            success: true,
            data: { enrollments }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get course enrollments (instructor/admin only)
 */
const getCourseEnrollments = async (req, res, next) => {
    try {
        const { courseId } = req.params;

        // Check if user is instructor or admin
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        if (req.user.role !== 'admin' && course.instructor_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to view course enrollments'
            });
        }

        const enrollments = await Enrollment.getByCourse(courseId);

        res.json({
            success: true,
            data: { enrollments }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update progress
 */
const updateProgress = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const { progress } = req.body;

        // Validate progress
        if (progress < 0 || progress > 100) {
            return res.status(400).json({
                success: false,
                message: 'Progress must be between 0 and 100'
            });
        }

        // Check if enrolled
        const isEnrolled = await Enrollment.isEnrolled(req.user.id, courseId);
        if (!isEnrolled) {
            return res.status(404).json({
                success: false,
                message: 'You are not enrolled in this course'
            });
        }

        await Enrollment.updateProgress(req.user.id, courseId, progress);

        res.json({
            success: true,
            message: 'Progress updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Unenroll from course
 */
const unenrollFromCourse = async (req, res, next) => {
    try {
        const { courseId } = req.params;

        const deleted = await Enrollment.delete(req.user.id, courseId);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        res.json({
            success: true,
            message: 'Successfully unenrolled from course'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    enrollInCourse,
    getMyEnrollments,
    getCourseEnrollments,
    updateProgress,
    unenrollFromCourse
};
