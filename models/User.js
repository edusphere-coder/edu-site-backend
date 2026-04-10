const { pool } = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password');

class User {
    /**
     * Create a new user
     */
    static async create(userData) {
        try {
            const { first_name, last_name, email, password, phone, address, role = 'student' } = userData;

            // ✅ Validation
            if (!first_name || !last_name || !email || !password) {
                throw new Error("All required fields must be provided");
            }

            // ✅ Hash password
            const hashedPassword = await hashPassword(password);

            const query = `
                INSERT INTO users 
                (first_name, last_name, email, password, phone, address, role, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, true)
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

        } catch (error) {
            console.error("CREATE USER ERROR:", error);
            throw error;
        }
    }

    /**
     * Find user by email
     */
    static async findByEmail(email) {
        try {
            const query = 'SELECT * FROM users WHERE email = ?';
            const [rows] = await pool.execute(query, [email]);
            return rows[0];
        } catch (error) {
            console.error("FIND BY EMAIL ERROR:", error);
            throw error;
        }
    }

    /**
     * Find user by ID
     */
    static async findById(id) {
        try {
            const query = `
                SELECT id, first_name, last_name, email, phone, address, role, is_active, created_at 
                FROM users WHERE id = ?
            `;
            const [rows] = await pool.execute(query, [id]);
            return rows[0];
        } catch (error) {
            console.error("FIND BY ID ERROR:", error);
            throw error;
        }
    }

    /**
     * Update user
     */
    static async update(id, userData) {
        try {
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
        } catch (error) {
            console.error("UPDATE USER ERROR:", error);
            throw error;
        }
    }

    /**
     * Verify password
     */
    static async verifyPassword(plainPassword, hashedPassword) {
        try {
            return await comparePassword(plainPassword, hashedPassword);
        } catch (error) {
            console.error("VERIFY PASSWORD ERROR:", error);
            throw error;
        }
    }

    /**
     * Get all users
     */
    static async getAll() {
        const query = `
            SELECT id, first_name, last_name, email, phone, role, is_active, created_at 
            FROM users
        `;
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
