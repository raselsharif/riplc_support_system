const pool = require("../config/database");

class Ticket {
  static generateTicketNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `TKT-${year}${month}-${random}`;
  }

  static async create({
    ticket_number,
    user_id,
    department_id,
    problem_type,
    title,
    description,
    priority,
    branch_id,
    status = "open",
    created_ip = null,
  }) {
    const [result] = await pool.execute(
      `INSERT INTO tickets (ticket_number, user_id, department_id, problem_type, title, description, priority, branch_id, status, created_ip)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ticket_number,
        user_id,
        department_id,
        problem_type,
        title,
        description,
        priority || "medium",
        branch_id,
        status,
        created_ip,
      ],
    );
    return result.insertId;
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT t.*,
             u.name as user_name, u.email as user_email,
             d.name as department_name,
             b.name as branch_name,
             b.code as branch_code,
             handler.name as handler_name,
             (SELECT COUNT(*) FROM ticket_messages WHERE ticket_id = t.id) as message_count,
             (SELECT COUNT(*) FROM ticket_attachments WHERE ticket_id = t.id) as attachment_count
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN departments d ON t.department_id = d.id
      LEFT JOIN branches b ON t.branch_id = b.id
      LEFT JOIN users handler ON t.current_handler_id = handler.id
      WHERE 1=1
    `;
    const params = [];

    if (
      filters.user_id &&
      filters.role !== "admin" &&
      filters.role !== "it" &&
      filters.role !== "underwriting" &&
      filters.role !== "mis"
    ) {
      query += " AND t.user_id = ?";
      params.push(filters.user_id);
    }

    if (filters.department_id) {
      query += " AND t.department_id = ?";
      params.push(filters.department_id);
    }

    if (filters.branch_id) {
      query += " AND t.branch_id = ?";
      params.push(filters.branch_id);
    }

    if (filters.branch_ids && filters.branch_ids.length > 0) {
      const placeholders = filters.branch_ids.map(() => "?").join(",");
      query += ` AND t.branch_id IN (${placeholders})`;
      params.push(...filters.branch_ids);
    }

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        const placeholders = filters.status.map(() => "?").join(",");
        query += ` AND t.status IN (${placeholders})`;
        params.push(...filters.status);
      } else {
        query += " AND t.status = ?";
        params.push(filters.status);
      }
    }

    if (filters.problem_type) {
      query += " AND t.problem_type = ?";
      params.push(filters.problem_type);
    }

    if (filters.date_from) {
      query += " AND DATE(t.created_at) >= ?";
      params.push(filters.date_from);
    }

    if (filters.date_to) {
      query += " AND DATE(t.created_at) <= ?";
      params.push(filters.date_to);
    }

    if (filters.search) {
      query +=
        " AND (t.ticket_number LIKE ? OR t.title LIKE ? OR t.description LIKE ?)";
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += " ORDER BY t.created_at DESC";

    if (filters.limit) {
      query += ` LIMIT ${parseInt(filters.limit)}`;
    }

    if (filters.offset) {
      query += ` OFFSET ${parseInt(filters.offset)}`;
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT t.*,
              u.name as user_name, u.email as user_email,
              d.name as department_name,
              b.name as branch_name, b.code as branch_code,
              handler.name as handler_name,
              approver.name as approver_name
       FROM tickets t
       LEFT JOIN users u ON t.user_id = u.id
       LEFT JOIN departments d ON t.department_id = d.id
       LEFT JOIN branches b ON t.branch_id = b.id
       LEFT JOIN users handler ON t.current_handler_id = handler.id
       LEFT JOIN users approver ON t.approved_by = approver.id
       WHERE t.id = ?`,
      [id],
    );
    return rows[0];
  }

  static async updateStatus(id, status, handlerId = null) {
    let query = "UPDATE tickets SET status = ?";
    const params = [status];

    if (handlerId) {
      query += ", current_handler_id = ?";
      params.push(handlerId);
    }

    if (status === "closed") {
      query += ", closed_at = CURRENT_TIMESTAMP";
    }

    query += " WHERE id = ?";
    params.push(id);

    const [result] = await pool.execute(query, params);
    return result.affectedRows > 0;
  }

  static async forwardToIT(id, approvedBy) {
    const [result] = await pool.execute(
      `UPDATE tickets
       SET department_id = 1, status = 'approved', approved_by = ?, approved_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [approvedBy, id],
    );
    return result.affectedRows > 0;
  }

  static async getStats(branchId = null) {
    let query = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed
      FROM tickets
      WHERE 1=1
    `;
    const params = [];

    if (branchId) {
      query += " AND branch_id = ?";
      params.push(branchId);
    }

    const [rows] = await pool.execute(query, params);
    return rows[0];
  }

  static async getBranchStats() {
    const [rows] = await pool.execute(
      `SELECT b.id, b.name, b.code AS branch_code,
              COUNT(t.id) as total_tickets,
              SUM(CASE WHEN t.status = 'open' THEN 1 ELSE 0 END) as open_tickets,
              SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) as pending_tickets,
              SUM(CASE WHEN t.status = 'approved' THEN 1 ELSE 0 END) as approved_tickets,
              SUM(CASE WHEN t.status = 'closed' THEN 1 ELSE 0 END) as closed_tickets
       FROM branches b
       LEFT JOIN tickets t ON b.id = t.branch_id
       WHERE b.is_active = TRUE
       GROUP BY b.id, b.name, b.code
       ORDER BY total_tickets DESC`,
    );
    return rows;
  }

  static async getCountsByStatus(branchId = null) {
    let query = `
      SELECT status, COUNT(*) as count
      FROM tickets
    `;
    const params = [];

    if (branchId) {
      query += " WHERE branch_id = ?";
      params.push(branchId);
    }

    query += " GROUP BY status";

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async delete(id) {
    const [result] = await pool.execute("DELETE FROM tickets WHERE id = ?", [
      id,
    ]);
    return result.affectedRows > 0;
  }
}

module.exports = Ticket;
