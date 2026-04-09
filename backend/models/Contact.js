const pool = require("../config/database");

const CONTACT_FIELDS =
  "c.id, c.name, c.phone, c.email, c.department_id, c.branch_id, c.created_by, c.created_at, c.updated_at";

class Contact {
  static async findAll() {
    const [rows] = await pool.execute(
      `SELECT ${CONTACT_FIELDS}, b.name as branch_name, b.code as branch_code, d.name as department_name
       FROM contacts c
       LEFT JOIN branches b ON c.branch_id = b.id
       LEFT JOIN departments d ON c.department_id = d.id
       ORDER BY b.code ASC, c.name ASC`
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT ${CONTACT_FIELDS}, b.name as branch_name, b.code as branch_code, d.name as department_name
       FROM contacts c
       LEFT JOIN branches b ON c.branch_id = b.id
       LEFT JOIN departments d ON c.department_id = d.id
       WHERE c.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async create({ name, phone, email, department_id, branch_id, created_by }) {
    const [result] = await pool.execute(
      "INSERT INTO contacts (name, phone, email, department_id, branch_id, created_by) VALUES (?, ?, ?, ?, ?, ?)",
      [name, phone, email || null, department_id, branch_id, created_by]
    );
    return result.insertId;
  }

  static async update(id, { name, phone, email, department_id, branch_id }) {
    await pool.execute(
      "UPDATE contacts SET name = ?, phone = ?, email = ?, department_id = ?, branch_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [name, phone, email || null, department_id, branch_id, id]
    );
    return Contact.findById(id);
  }

  static async delete(id) {
    const [result] = await pool.execute(
      "DELETE FROM contacts WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Contact;
