const pool = require('../config/database');

class StatusHistory {
  static async create({ ticketId, changedBy, fromStatus, toStatus, remarks }) {
    const [result] = await pool.execute(
      `INSERT INTO ticket_status_history (ticket_id, changed_by, from_status, to_status, remarks)
       VALUES (?, ?, ?, ?, ?)`,
      [ticketId, changedBy, fromStatus, toStatus, remarks || null]
    );
    return result.insertId;
  }

  static async findByTicketId(ticketId) {
    const [rows] = await pool.execute(
      `SELECT h.*, u.name as changed_by_name, u.role as changed_by_role
       FROM ticket_status_history h
       JOIN users u ON h.changed_by = u.id
       WHERE h.ticket_id = ?
       ORDER BY h.created_at ASC`,
      [ticketId]
    );
    return rows;
  }
}

module.exports = StatusHistory;
