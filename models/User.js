const { pool } = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password');

class User {
    /**
     * Create a new user
     */
    static async create(userData) {
        const { first_name, last_name, email, password, phone, address, role = 'student' } = userData;

        // Hash password
        const hashedPassword = await hashPassword(password);

        const query = `
      INSERT INTO users (first_name, last_name, email, password, phone, address, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, false)
    `;

        const [result] = await pool.execute(query, [
            first_name,
            last_name,
            email,
            hashedPassword,
            phone || null,
            address || null,
            role
        ]);

        return result.insertId;
    }

    /**
     * Find user by email
     */
    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await pool.execute(query, [email]);
        return rows[0];
    }

    /**
     * Find user by ID
     */
    static async findById(id) {
        const query = 'SELECT id, first_name, last_name, email, phone, address, role, is_active, created_at FROM users WHERE id = ?';
        const [rows] = await pool.execute(query, [id]);
        return rows[0];
    }

    /**
     * Update user
     */
    static async update(id, userData) {
        const { first_name, last_name, phone, address } = userData;

        const query = `
      UPDATE users 
      SET first_name = ?, last_name = ?, phone = ?, address = ?
      WHERE id = ?
    `;

        const [result] = await pool.execute(query, [
            first_name,
            last_name,
            phone || null,
            address || null,
            id
        ]);

        return result.affectedRows > 0;
    }

    /**
     * Update user active status (admin only)
     */
    static async updateActiveStatus(id, isActive) {
        const query = 'UPDATE users SET is_active = ? WHERE id = ?';
        const [result] = await pool.execute(query, [isActive, id]);
        return result.affectedRows > 0;
    }

    /**
     * Get all inactive users (admin only)
     */
    static async getAllInactive() {
        const query = 'SELECT id, first_name, last_name, email, phone, role, created_at FROM users WHERE is_active = false ORDER BY created_at DESC';
        const [rows] = await pool.execute(query);
        return rows;
    }

    /**
     * Verify password
     */
    static async verifyPassword(plainPassword, hashedPassword) {
        return await comparePassword(plainPassword, hashedPassword);
    }

    /**
     * Get all users (admin only)
     */
    static async getAll() {
        const query = 'SELECT id, first_name, last_name, email, phone, role, is_active, created_at FROM users';
        const [rows] = await pool.execute(query);
        return rows;
    }

    /**
     * Delete user
     */
    static async delete(id) {
        const query = 'DELETE FROM users WHERE id = ?';
        const [result] = await pool.execute(query, [id]);
        return result.affectedRows > 0;
    }
}

module.exports = User;
