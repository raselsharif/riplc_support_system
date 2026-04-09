const express = require('express');
const DashboardController = require('../controllers/DashboardController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const pool = require('../config/database');

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware(['admin', 'mis', 'it', 'underwriting']));

router.get('/branch-stats', DashboardController.getBranchStats);
router.get('/stats', DashboardController.getStats);

router.get('/analytics', roleMiddleware('admin'), async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;

    const [totalRows] = await pool.query("SELECT COUNT(*) as total FROM tickets");
    const [newRows] = await pool.query(
      "SELECT COUNT(*) as total FROM tickets WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)",
      [days]
    );
    const [resolvedRows] = await pool.query(
      "SELECT COUNT(*) as total FROM tickets WHERE status = 'closed'"
    );
    const [activeUsers] = await pool.query(
      "SELECT COUNT(DISTINCT user_id) as total FROM activity_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)",
      [days]
    );

    const [dailyTickets] = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count 
       FROM tickets 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) 
       GROUP BY DATE(created_at) ORDER BY date ASC`,
      [days]
    );

    const [byDepartment] = await pool.query(
      `SELECT problem_type, COUNT(*) as count FROM tickets GROUP BY problem_type`
    );

    const [byPriority] = await pool.query(
      `SELECT priority, COUNT(*) as count FROM tickets GROUP BY priority`
    );

    const [avgResponse] = await pool.query(
      `SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as avg_hours FROM tickets WHERE status != 'open'`
    );

    res.json({
      totalTickets: totalRows[0]?.total || 0,
      newTickets: newRows[0]?.total || 0,
      resolvedTickets: resolvedRows[0]?.total || 0,
      activeUsers: activeUsers[0]?.total || 0,
      avgResponseTime: Math.round(avgResponse[0]?.avg_hours || 0),
      dailyTickets: dailyTickets.map((d) => ({
        date: new Date(d.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
        count: d.count,
      })),
      byDepartment,
      byPriority,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/export/csv', roleMiddleware('admin'), async (req, res) => {
  try {
    const { type = 'tickets' } = req.query;
    let rows = [];
    let headers = [];

    if (type === 'tickets') {
      [rows] = await pool.query(
        `SELECT t.ticket_number, t.title, t.status, t.priority, t.problem_type, 
                u.name as user_name, b.name as branch_name, t.created_at
         FROM tickets t
         LEFT JOIN users u ON t.user_id = u.id
         LEFT JOIN branches b ON t.branch_id = b.id
         ORDER BY t.created_at DESC LIMIT 1000`
      );
      headers = ["Ticket #", "Title", "Status", "Priority", "Type", "User", "Branch", "Created"];
    }

    const csvRows = [headers.join(",")];
    rows.forEach((row) => {
      csvRows.push(
        Object.values(row)
          .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
          .join(",")
      );
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=${type}_export.csv`);
    res.send(csvRows.join("\n"));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
