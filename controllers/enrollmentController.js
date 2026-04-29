const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');

const INVALID_COURSE_PARAM_VALUES = new Set(['', 'undefined', 'null', 'nan']);

const parseSlugFromReferer = (referer) => {
    if (!referer || typeof referer !== 'string') return null;

    try {
        const url = new URL(referer);
        const match = url.pathname.match(/\/courses\/([^/?#]+)/i);
        return match ? decodeURIComponent(match[1]) : null;
    } catch (_error) {
        return null;
    }
};

const resolveCourseFromParam = async (courseParam) => {
    const normalized = String(courseParam || '').trim();
    if (!normalized || INVALID_COURSE_PARAM_VALUES.has(normalized.toLowerCase())) {
        return null;
    }

    if (/^\d+$/.test(normalized)) {
        return Course.findById(Number(normalized));
    }

    return Course.getBySlug(normalized);
};

const resolveCourseForEnrollment = async (req) => {
    const directCourse = await resolveCourseFromParam(req.params.courseId);
    if (directCourse) return directCourse;

    // Backward compatibility fallback for older clients sending invalid route params.
    const bodySlug = req.body?.course_slug || req.body?.courseSlug;
    const headerSlug = req.headers['x-course-slug'];
    const refererSlug = parseSlugFromReferer(req.headers.referer);

    const candidates = [bodySlug, headerSlug, refererSlug];
    for (const candidate of candidates) {
        const resolved = await resolveCourseFromParam(candidate);
        if (resolved) return resolved;
    }

    return null;
};

/**
 * Enroll in a course
 */
const enrollInCourse = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const { access_code } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.access_code) {
            return res.status(403).json({
                success: false,
                message: 'No access code assigned to this user. Please contact support.'
            });
        }

        if (String(access_code).toUpperCase() !== String(user.access_code).toUpperCase()) {
            return res.status(403).json({
                success: false,
                message: 'Invalid access code'
            });
        }

        // Check if course exists (with compatibility fallbacks for invalid params)
        const course = await resolveCourseForEnrollment(req);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if already enrolled
        const normalizedCourseId = course.id;
        const isEnrolled = await Enrollment.isEnrolled(req.user.id, normalizedCourseId);
        if (isEnrolled) {
            return res.status(409).json({
                success: false,
                message: 'You are already enrolled in this course'
            });
        }

        // Enroll user
        await Enrollment.create(req.user.id, normalizedCourseId);

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
        const course = await resolveCourseFromParam(courseId);
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

        const enrollments = await Enrollment.getByCourse(course.id);

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

        const course = await resolveCourseFromParam(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if enrolled
        const isEnrolled = await Enrollment.isEnrolled(req.user.id, course.id);
        if (!isEnrolled) {
            return res.status(404).json({
                success: false,
                message: 'You are not enrolled in this course'
            });
        }

        await Enrollment.updateProgress(req.user.id, course.id, progress);

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

        const course = await resolveCourseFromParam(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        const deleted = await Enrollment.delete(req.user.id, course.id);

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
