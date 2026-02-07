const { pool } = require('../config/database');

class Enrollment {
    /**
     * Enroll user in a course
     */
    static async create(userId, courseId) {
        const query = `
      INSERT INTO enrollments (user_id, course_id)
      VALUES (?, ?)
    `;

        const [result] = await pool.execute(query, [userId, courseId]);
        return result.insertId;
    }

    /**
     * Check if user is enrolled in a course
     */
    static async isEnrolled(userId, courseId) {
        const query = 'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?';
        const [rows] = await pool.execute(query, [userId, courseId]);
        return rows.length > 0;
    }

    /**
     * Get user's enrollments
     */
    static async getByUser(userId) {
        const query = `
      SELECT e.*, c.title, c.description, c.thumbnail, c.level
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.user_id = ?
      ORDER BY e.enrolled_at DESC
    `;

        const [rows] = await pool.execute(query, [userId]);
        return rows;
    }

    /**
     * Get course enrollments
     */
    static async getByCourse(courseId) {
        const query = `
      SELECT e.*, u.first_name, u.last_name, u.email
      FROM enrollments e
      JOIN users u ON e.user_id = u.id
      WHERE e.course_id = ?
      ORDER BY e.enrolled_at DESC
    `;

        const [rows] = await pool.execute(query, [courseId]);
        return rows;
    }

    /**
     * Update progress
     */
    static async updateProgress(userId, courseId, progress) {
        const query = `
      UPDATE enrollments 
      SET progress = ?, completed = ?
      WHERE user_id = ? AND course_id = ?
    `;

        const completed = progress >= 100;
        const [result] = await pool.execute(query, [progress, completed, userId, courseId]);
        return result.affectedRows > 0;
    }

    /**
     * Unenroll user from course
     */
    static async delete(userId, courseId) {
        const query = 'DELETE FROM enrollments WHERE user_id = ? AND course_id = ?';
        const [result] = await pool.execute(query, [userId, courseId]);
        return result.affectedRows > 0;
    }
}

module.exports = Enrollment;
