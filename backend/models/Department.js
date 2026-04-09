const pool = require('../config/database');

class Department {
  static async findAll() {
    const [rows] = await pool.execute('SELECT * FROM departments ORDER BY name ASC');
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM departments WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByCode(code) {
    const [rows] = await pool.execute('SELECT * FROM departments WHERE code = ?', [code]);
    return rows[0];
  }
}

module.exports = Department;
