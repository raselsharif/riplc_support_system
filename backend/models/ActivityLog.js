const pool = require("../config/database");

class ActivityLog {
  static parseDetails(details) {
    if (!details) return {};
    const out = {};
    // Expecting "key: value | key2: value2" style
    const parts = details.split("|").map((p) => p.trim());
    parts.forEach((p) => {
      const [k, ...rest] = p.split(":");
      if (k && rest.length) out[k.trim()] = rest.join(":").trim();
    });
    // Extra safety regex
    const matchReal = details.match(/real_ip\s*:\s*([^|]+)/i);
    const matchLocal = details.match(/local_ip\s*:\s*([^|]+)/i);
    const matchUA = details.match(/user_agent\s*:\s*([^|]+)/i);
    if (matchReal) out.real_ip = out.real_ip || matchReal[1].trim();
    if (matchLocal) out.local_ip = out.local_ip || matchLocal[1].trim();
    if (matchUA) out.user_agent = out.user_agent || matchUA[1].trim();
    return out;
  }

  static async create({ user_id, action, entity_type, entity_id, details, client_ip = null }) {
    await pool.execute(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, client_ip)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, action, entity_type, entity_id || null, details || null, client_ip || null]
    );
  }

  static async findAll({ page = 1, limit = 20, user_id, entity_type, action, search, start_date, end_date }) {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let query = `SELECT al.*, u.name as user_name, u.role as user_role
                 FROM activity_logs al
                 LEFT JOIN users u ON al.user_id = u.id
                 WHERE 1=1`;
    const params = [];

    if (user_id) {
      query += " AND al.user_id = ?";
      params.push(user_id);
    }
    if (entity_type) {
      query += " AND al.entity_type = ?";
      params.push(entity_type);
    }
    if (action) {
      query += " AND al.action = ?";
      params.push(action);
    }
    if (search) {
      query += " AND (u.name LIKE ? OR u.username LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    if (start_date) {
      query += " AND al.created_at >= ?";
      params.push(start_date);
    }
    if (end_date) {
      query += " AND al.created_at <= ?";
      params.push(`${end_date} 23:59:59`);
    }

    query += " ORDER BY al.created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);

    const [rows] = await pool.query(query, params);
    const mapped = rows.map((row) => {
      const parsed = ActivityLog.parseDetails(row.details);
      return {
        ...row,
        real_ip: parsed.real_ip || null,
        local_ip: parsed.local_ip || null,
        user_agent: parsed.user_agent || null,
        client_ip: row.client_ip || parsed.real_ip || null,
      };
    });
    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE 1=1` +
        (user_id ? " AND al.user_id = ?" : "") +
        (entity_type ? " AND al.entity_type = ?" : "") +
        (action ? " AND al.action = ?" : "") +
        (search ? " AND (u.name LIKE ? OR u.username LIKE ?)" : "") +
        (start_date ? " AND al.created_at >= ?" : "") +
        (end_date ? " AND al.created_at <= ?" : ""),
      [user_id, entity_type, action]
        .filter(Boolean)
        .concat(search ? [`%${search}%`, `%${search}%`] : [])
        .concat(start_date ? [start_date] : [])
        .concat(end_date ? [`${end_date} 23:59:59`] : [])
    );

    return { logs: mapped, total: countRows[0].total, page: parseInt(page), limit: parseInt(limit) };
  }

  static async getStats() {
    const [rows] = await pool.query(
      `SELECT action, COUNT(*) as count FROM activity_logs
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY action ORDER BY count DESC`
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT al.*, u.name as user_name, u.username as user_username, u.role as user_role
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.id = ?`,
      [id]
    );
    if (!rows.length) return null;
    const parsed = ActivityLog.parseDetails(rows[0].details);
    return {
      ...rows[0],
      real_ip: parsed.real_ip || null,
      local_ip: parsed.local_ip || null,
      user_agent: parsed.user_agent || null,
      client_ip: rows[0].client_ip || parsed.real_ip || null,
    };
  }
}

module.exports = ActivityLog;
