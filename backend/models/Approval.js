const pool = require('../config/database');

class Approval {
  static async create({ ticketId, approverId, departmentId, action, remarks, fromStatus, toStatus }) {
    const [result] = await pool.execute(
      `INSERT INTO ticket_approvals (ticket_id, approver_id, department_id, action, remarks, from_status, to_status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [ticketId, approverId, departmentId, action, remarks || null, fromStatus, toStatus]
    );
    return result.insertId;
  }

  static async findByTicketId(ticketId) {
    const [rows] = await pool.execute(
      `SELECT a.*, u.name as approver_name, d.name as department_name
       FROM ticket_approvals a
       JOIN users u ON a.approver_id = u.id
       JOIN departments d ON a.department_id = d.id
       WHERE a.ticket_id = ?
       ORDER BY a.created_at ASC`,
      [ticketId]
    );
    return rows;
  }
}

module.exports = Approval;
