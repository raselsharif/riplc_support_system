const pool = require('../config/database');

class Attachment {
  static async create({ ticketId, uploadedBy, fileUrl, publicId, fileName, fileType, fileSize }) {
    const [result] = await pool.execute(
      `INSERT INTO ticket_attachments (ticket_id, uploaded_by, file_url, public_id, file_name, file_type, file_size)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [ticketId, uploadedBy, fileUrl, publicId, fileName, fileType, fileSize]
    );
    return result.insertId;
  }

  static async findByTicketId(ticketId) {
    const [rows] = await pool.execute(
      `SELECT a.*, u.name as uploaded_by_name
       FROM ticket_attachments a
       JOIN users u ON a.uploaded_by = u.id
       WHERE a.ticket_id = ?
       ORDER BY a.created_at DESC`,
      [ticketId]
    );
    return rows;
  }

  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM ticket_attachments WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Attachment;
