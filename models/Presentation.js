const { pool } = require('../config/database');

class Presentation {
    /**
     * Create a new presentation
     */
    static async create(presentationData) {
        const { course_id, title, description, file_url, order_index = 0 } = presentationData;

        const query = `
      INSERT INTO presentations (course_id, title, description, file_url, order_index)
      VALUES (?, ?, ?, ?, ?)
    `;

        const [result] = await pool.execute(query, [
            course_id,
            title,
            description || null,
            file_url || null,
            order_index
        ]);

        return result.insertId;
    }

    /**
     * Get all presentations for a course
     */
    static async getByCourse(courseId) {
        const query = 'SELECT * FROM presentations WHERE course_id = ? ORDER BY order_index ASC';
        const [rows] = await pool.execute(query, [courseId]);
        return rows;
    }

    /**
     * Get presentation by ID
     */
    static async findById(id) {
        const query = 'SELECT * FROM presentations WHERE id = ?';
        const [rows] = await pool.execute(query, [id]);
        return rows[0];
    }

    /**
     * Update presentation
     */
    static async update(id, presentationData) {
        const { title, description, file_url, order_index } = presentationData;

        const query = `
      UPDATE presentations 
      SET title = ?, description = ?, file_url = ?, order_index = ?
      WHERE id = ?
    `;

        const [result] = await pool.execute(query, [
            title,
            description || null,
            file_url || null,
            order_index,
            id
        ]);

        return result.affectedRows > 0;
    }

    /**
     * Delete presentation
     */
    static async delete(id) {
        const query = 'DELETE FROM presentations WHERE id = ?';
        const [result] = await pool.execute(query, [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Presentation;
