const Recording = require('../models/Recording');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

/**
 * Get all recordings for a course (requires enrollment)
 */
const getRecordingsByCourse = async (req, res, next) => {
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
                message: 'You must be enrolled in this course to view recordings'
            });
        }

        const recordings = await Recording.getByCourse(courseId);

        res.json({
            success: true,
            data: { recordings }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create recording (instructor/admin only)
 */
const createRecording = async (req, res, next) => {
    try {
        const { course_id, title, description, video_url, duration, order_index } = req.body;

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
                message: 'You are not authorized to add recordings to this course'
            });
        }

        const recordingId = await Recording.create({
            course_id,
            title,
            description,
            video_url,
            duration,
            order_index
        });

        const recording = await Recording.findById(recordingId);

        res.status(201).json({
            success: true,
            message: 'Recording created successfully',
            data: { recording }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update recording (instructor/admin only)
 */
const updateRecording = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, video_url, duration, order_index } = req.body;

        const recording = await Recording.findById(id);
        if (!recording) {
            return res.status(404).json({
                success: false,
                message: 'Recording not found'
            });
        }

        // Check authorization
        const course = await Course.findById(recording.course_id);
        if (req.user.role !== 'admin' && course.instructor_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this recording'
            });
        }

        const updated = await Recording.update(id, {
            title,
            description,
            video_url,
            duration,
            order_index
        });

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Recording not found'
            });
        }

        const updatedRecording = await Recording.findById(id);

        res.json({
            success: true,
            message: 'Recording updated successfully',
            data: { recording: updatedRecording }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete recording (instructor/admin only)
 */
const deleteRecording = async (req, res, next) => {
    try {
        const { id } = req.params;

        const recording = await Recording.findById(id);
        if (!recording) {
            return res.status(404).json({
                success: false,
                message: 'Recording not found'
            });
        }

        // Check authorization
        const course = await Course.findById(recording.course_id);
        if (req.user.role !== 'admin' && course.instructor_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this recording'
            });
        }

        const deleted = await Recording.delete(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Recording not found'
            });
        }

        res.json({
            success: true,
            message: 'Recording deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getRecordingsByCourse,
    createRecording,
    updateRecording,
    deleteRecording
};
