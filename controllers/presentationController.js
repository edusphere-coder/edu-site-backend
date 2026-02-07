const Presentation = require('../models/Presentation');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

/**
 * Get all presentations for a course (requires enrollment)
 */
const getPresentationsByCourse = async (req, res, next) => {
    try {
        const { courseId } = req.params;

        // Check if user is enrolled or is instructor/admin
        const isEnrolled = await Enrollment.isEnrolled(req.user.id, courseId);
        const course = await Course.findById(courseId);

        const isInstructor = course && course.instructor_id === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isEnrolled && !isInstructor && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'You must be enrolled in this course to view presentations'
            });
        }

        const presentations = await Presentation.getByCourse(courseId);

        res.json({
            success: true,
            data: { presentations }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create presentation (instructor/admin only)
 */
const createPresentation = async (req, res, next) => {
    try {
        const { course_id, title, description, file_url, order_index } = req.body;

        // Check if user is instructor of the course or admin
        const course = await Course.findById(course_id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        if (req.user.role !== 'admin' && course.instructor_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to add presentations to this course'
            });
        }

        const presentationId = await Presentation.create({
            course_id,
            title,
            description,
            file_url,
            order_index
        });

        const presentation = await Presentation.findById(presentationId);

        res.status(201).json({
            success: true,
            message: 'Presentation created successfully',
            data: { presentation }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update presentation (instructor/admin only)
 */
const updatePresentation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, file_url, order_index } = req.body;

        const presentation = await Presentation.findById(id);
        if (!presentation) {
            return res.status(404).json({
                success: false,
                message: 'Presentation not found'
            });
        }

        // Check authorization
        const course = await Course.findById(presentation.course_id);
        if (req.user.role !== 'admin' && course.instructor_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this presentation'
            });
        }

        const updated = await Presentation.update(id, {
            title,
            description,
            file_url,
            order_index
        });

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Presentation not found'
            });
        }

        const updatedPresentation = await Presentation.findById(id);

        res.json({
            success: true,
            message: 'Presentation updated successfully',
            data: { presentation: updatedPresentation }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete presentation (instructor/admin only)
 */
const deletePresentation = async (req, res, next) => {
    try {
        const { id } = req.params;

        const presentation = await Presentation.findById(id);
        if (!presentation) {
            return res.status(404).json({
                success: false,
                message: 'Presentation not found'
            });
        }

        // Check authorization
        const course = await Course.findById(presentation.course_id);
        if (req.user.role !== 'admin' && course.instructor_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this presentation'
            });
        }

        const deleted = await Presentation.delete(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Presentation not found'
            });
        }

        res.json({
            success: true,
            message: 'Presentation deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPresentationsByCourse,
    createPresentation,
    updatePresentation,
    deletePresentation
};
