const pool = require("../config/database");

class Notice {
  static async create({ heading, detail, notice_date, notice_time, file_url, public_id, file_name, file_type, file_size, created_by }) {
    const [result] = await pool.execute(
      `INSERT INTO notices (heading, detail, notice_date, notice_time, file_url, public_id, file_name, file_type, file_size, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [heading, detail, notice_date, notice_time, file_url || null, public_id || null, file_name || null, file_type || null, file_size || null, created_by]
    );
    return result.insertId;
  }

  static async findAll(page = 1, limit = 9) {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const [rows] = await pool.query(
      `SELECT n.*,
              u.name as creator_name,
              u.role as creator_role
       FROM notices n
       LEFT JOIN users u ON n.created_by = u.id
       ORDER BY n.notice_date DESC, n.notice_time DESC
       LIMIT ${parseInt(limit)} OFFSET ${offset}`,
    );

    const [countRows] = await pool.execute("SELECT COUNT(*) as total FROM notices");
    return { notices: rows, total: countRows[0].total, page: parseInt(page), limit: parseInt(limit) };
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT n.*,
              u.name as creator_name,
              u.role as creator_role
       FROM notices n
       LEFT JOIN users u ON n.created_by = u.id
       WHERE n.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async update(id, { heading, detail, notice_date, notice_time, file_url, public_id, file_name, file_type, file_size }) {
    let query = "UPDATE notices SET heading = ?, detail = ?, notice_date = ?, notice_time = ?";
    const params = [heading, detail, notice_date, notice_time];

    if (file_url !== undefined) {
      query += ", file_url = ?";
      params.push(file_url);
      query += ", public_id = ?";
      params.push(public_id);
      query += ", file_name = ?";
      params.push(file_name);
      query += ", file_type = ?";
      params.push(file_type);
      query += ", file_size = ?";
      params.push(file_size);
    }

    query += " WHERE id = ?";
    params.push(id);

    const [result] = await pool.execute(query, params);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.execute("DELETE FROM notices WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  static async getLatestActiveNotice() {
    const today = new Date().toISOString().split("T")[0];
    const [rows] = await pool.execute(
      `SELECT n.*,
              u.name as creator_name
       FROM notices n
       LEFT JOIN users u ON n.created_by = u.id
       WHERE n.notice_date >= ?
       ORDER BY n.notice_date DESC, n.notice_time DESC
       LIMIT 1`,
      [today]
    );
    return rows[0];
  }

  static async getPopupSetting() {
    const [rows] = await pool.execute("SELECT * FROM notice_popup_settings LIMIT 1");
    return rows[0] || null;
  }

  static async setPopupSetting(enabled) {
    const existing = await this.getPopupSetting();
    if (existing) {
      await pool.execute("UPDATE notice_popup_settings SET popup_enabled = ?", [enabled]);
    } else {
      await pool.execute("INSERT INTO notice_popup_settings (popup_enabled) VALUES (?)", [enabled]);
    }
    return { popup_enabled: enabled };
  }
}

module.exports = Notice;
