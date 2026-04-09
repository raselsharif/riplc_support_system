const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create({ name, username, email, password, role = 'user', department_id, branch_id, profile_image_url }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      `INSERT INTO users (name, username, email, password, profile_image_url, role, department_id, branch_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, username, email || null, hashedPassword, profile_image_url || null, role, department_id || null, branch_id]
    );
    return result.insertId;
  }

  static async update(id, { name, username, email, role, branch_id, department_id, is_active, profile_image_url }) {
    const fields = [];
    const params = [];

    if (name !== undefined) { fields.push('name = ?'); params.push(name); }
    if (username !== undefined) { fields.push('username = ?'); params.push(username); }
    if (email !== undefined) { fields.push('email = ?'); params.push(email || null); }
    if (role !== undefined) { fields.push('role = ?'); params.push(role); }
    if (branch_id !== undefined) { fields.push('branch_id = ?'); params.push(branch_id || null); }
    if (department_id !== undefined) { fields.push('department_id = ?'); params.push(department_id || null); }
    if (is_active !== undefined) { fields.push('is_active = ?'); params.push(is_active); }
    if (profile_image_url !== undefined) { fields.push('profile_image_url = ?'); params.push(profile_image_url || null); }

    if (!fields.length) return false;

    params.push(id);
    const [result] = await pool.execute(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      params
    );
    return result.affectedRows > 0;
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute(
      `SELECT u.*, d.name as department_name, b.name as branch_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN branches b ON u.branch_id = b.id
       WHERE u.email = ?`,
      [email]
    );
    return rows[0];
  }

  static async findByUsername(username) {
    const [rows] = await pool.execute(
      `SELECT u.*, d.name as department_name, b.name as branch_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN branches b ON u.branch_id = b.id
       WHERE u.username = ?`,
      [username]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT u.*, d.name as department_name, b.name as branch_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN branches b ON u.branch_id = b.id
       WHERE u.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT u.*, d.name as department_name, b.name as branch_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN branches b ON u.branch_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.role) {
      query += ' AND u.role = ?';
      params.push(filters.role);
    }

    if (filters.department_id) {
      query += ' AND u.department_id = ?';
      params.push(filters.department_id);
    }

    if (filters.branch_id) {
      query += ' AND u.branch_id = ?';
      params.push(filters.branch_id);
    }

    if (filters.is_active !== undefined) {
      query += ' AND u.is_active = ?';
      params.push(filters.is_active);
    }

    query += ' ORDER BY u.created_at DESC';

    if (filters.limit) {
      query += ` LIMIT ${parseInt(filters.limit)}`;
    }

    if (filters.offset) {
      query += ` OFFSET ${parseInt(filters.offset)}`;
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async updateStatus(id, isActive) {
    const [result] = await pool.execute(
      'UPDATE users SET is_active = ? WHERE id = ?',
      [isActive, id]
    );
    return result.affectedRows > 0;
  }

  static async updateLastLogin(id) {
    await pool.execute(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
  }

  static async updateLastSeen(id) {
    await pool.execute(
      'UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
  }

  static async updatePassword(id, newPassword) {
    const hashed = await bcrypt.hash(newPassword, 10);
    const [result] = await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashed, id]
    );
    return result.affectedRows > 0;
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async countByBranch(branchId = null) {
    let query = `
      SELECT branch_id, COUNT(*) as count
      FROM users
      WHERE is_active = TRUE
    `;
    const params = [];

    if (branchId) {
      query += ' AND branch_id = ?';
      params.push(branchId);
    }

    query += ' GROUP BY branch_id';

    const [rows] = await pool.execute(query, params);
    return rows;
  }
}

module.exports = User;
