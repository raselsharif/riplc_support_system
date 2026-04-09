const pool = require("../config/database");

const BRANCH_FIELDS =
  "id, name, code, code AS branch_code, address, is_active, created_at, updated_at";

class Branch {
  static async findAll(activeOnly = true) {
    let query = `SELECT ${BRANCH_FIELDS} FROM branches`;
    if (activeOnly) {
      query += " WHERE is_active = TRUE";
    }
    // sort numerically when codes are numbers; fallback to lexical
    query += " ORDER BY CAST(code AS UNSIGNED), code ASC";
    const [rows] = await pool.execute(query);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT ${BRANCH_FIELDS} FROM branches WHERE id = ?`,
      [id],
    );
    return rows[0];
  }

  static async findByCode(branchCode) {
    const [rows] = await pool.execute(
      `SELECT ${BRANCH_FIELDS} FROM branches WHERE code = ?`,
      [branchCode],
    );
    return rows[0];
  }

  static async create({ name, branch_code, address }) {
    const codeValue = String(branch_code);
    const [result] = await pool.execute(
      "INSERT INTO branches (name, code, address, is_active) VALUES (?, ?, ?, TRUE)",
      [name, codeValue, address],
    );
    return result.insertId;
  }

  static async updateById(id, { name, branch_code, address }) {
    const codeValue = String(branch_code);
    await pool.execute(
      "UPDATE branches SET name = ?, code = ?, address = ? WHERE id = ?",
      [name, codeValue, address, id],
    );
    return Branch.findById(id);
  }

  static async softDelete(id) {
    const [result] = await pool.execute(
      "UPDATE branches SET is_active = FALSE WHERE id = ?",
      [id],
    );
    return result.affectedRows > 0;
  }
}

module.exports = Branch;
