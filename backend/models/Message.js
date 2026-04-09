const pool = require('../config/database');

class Message {
  static async create({ ticketId, senderId, message, isInternal = false, senderIp = null }) {
    const [result] = await pool.execute(
      'INSERT INTO ticket_messages (ticket_id, sender_id, message, is_internal, sender_ip) VALUES (?, ?, ?, ?, ?)',
      [ticketId, senderId, message, isInternal, senderIp]
    );
    return result.insertId;
  }

  static async findByTicketId(ticketId) {
    const [rows] = await pool.execute(
      `SELECT m.*, u.name as sender_name, u.role as sender_role, u.department_id
       FROM ticket_messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.ticket_id = ?
       ORDER BY m.created_at ASC`,
      [ticketId]
    );
    return rows;
  }
}

module.exports = Message;
