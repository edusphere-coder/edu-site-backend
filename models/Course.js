const { pool } = require('../config/database');

class Course {
    /**
     * Get all published courses
     */
    static async getAll() {
        const query = `
            SELECT c.*, 
                   CONCAT(u.first_name, ' ', u.last_name) as instructor_name
            FROM courses c
            LEFT JOIN users u ON c.instructor_id = u.id
            WHERE c.is_published = true
            ORDER BY c.created_at DESC
        `;
        const [rows] = await pool.execute(query);
        return rows;
    }

    /**
     * Get course by slug
     */
    static async getBySlug(slug) {
        const query = `
            SELECT c.*, 
                   CONCAT(u.first_name, ' ', u.last_name) as instructor_name,
                   u.email as instructor_email
            FROM courses c
            LEFT JOIN users u ON c.instructor_id = u.id
            WHERE c.slug = ? AND c.is_published = true
        `;
        const [rows] = await pool.execute(query, [slug]);
        return rows[0];
    }

    /**
     * Get course by ID
     */
    static async getById(id) {
        const query = `
            SELECT c.*, 
                   CONCAT(u.first_name, ' ', u.last_name) as instructor_name
            FROM courses c
            LEFT JOIN users u ON c.instructor_id = u.id
            WHERE c.id = ?
        `;
        const [rows] = await pool.execute(query, [id]);
        return rows[0];
    }

    /**
     * Backward-compatible alias for controllers using findById.
     */
    static async findById(id) {
        return Course.getById(id);
    }

    /**
     * Get presentations for a course
     */
    static async getPresentations(courseId) {
        const query = `
            SELECT * FROM presentations
            WHERE course_id = ?
            ORDER BY order_index ASC
        `;
        const [rows] = await pool.execute(query, [courseId]);
        return rows;
    }

    /**
     * Get recordings for a course
     */
    static async getRecordings(courseId) {
        const query = `
            SELECT * FROM recordings
            WHERE course_id = ?
            ORDER BY order_index ASC
        `;
        const [rows] = await pool.execute(query, [courseId]);
        return rows;
    }

    /**
     * Get all presentations grouped by course
     */
    static async getAllPresentations() {
        const query = `
            SELECT p.*, c.title as course_title, c.slug as course_slug
            FROM presentations p
            INNER JOIN courses c ON p.course_id = c.id
            WHERE c.is_published = true
            ORDER BY c.id ASC, p.order_index ASC
        `;
        const [rows] = await pool.execute(query);
        return rows;
    }

    /**
     * Get all recordings grouped by course
     */
    static async getAllRecordings() {
        const query = `
            SELECT r.*, c.title as course_title, c.slug as course_slug
            FROM recordings r
            INNER JOIN courses c ON r.course_id = c.id
            WHERE c.is_published = true
            ORDER BY c.id ASC, r.order_index ASC
        `;
        const [rows] = await pool.execute(query);
        return rows;
    }
}

module.exports = Course;
