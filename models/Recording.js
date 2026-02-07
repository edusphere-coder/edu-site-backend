const { pool } = require('../config/database');

class Recording {
    /**
     * Create a new recording
     */
    static async create(recordingData) {
        const { course_id, title, description, video_url, duration, order_index = 0 } = recordingData;

        const query = `
      INSERT INTO recordings (course_id, title, description, video_url, duration, order_index)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

        const [result] = await pool.execute(query, [
            course_id,
            title,
            description || null,
            video_url || null,
            duration || null,
            order_index
        ]);

        return result.insertId;
    }

    /**
     * Get all recordings for a course
     */
    static async getByCourse(courseId) {
        const query = 'SELECT * FROM recordings WHERE course_id = ? ORDER BY order_index ASC';
        const [rows] = await pool.execute(query, [courseId]);
        return rows;
    }

    /**
     * Get recording by ID
     */
    static async findById(id) {
        const query = 'SELECT * FROM recordings WHERE id = ?';
        const [rows] = await pool.execute(query, [id]);
        return rows[0];
    }

    /**
     * Update recording
     */
    static async update(id, recordingData) {
        const { title, description, video_url, duration, order_index } = recordingData;

        const query = `
      UPDATE recordings 
      SET title = ?, description = ?, video_url = ?, duration = ?, order_index = ?
      WHERE id = ?
    `;

        const [result] = await pool.execute(query, [
            title,
            description || null,
            video_url || null,
            duration || null,
            order_index,
            id
        ]);

        return result.affectedRows > 0;
    }

    /**
     * Delete recording
     */
    static async delete(id) {
        const query = 'DELETE FROM recordings WHERE id = ?';
        const [result] = await pool.execute(query, [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Recording;
