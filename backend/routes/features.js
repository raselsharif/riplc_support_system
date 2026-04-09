const express = require("express");
const crypto = require("crypto");
const pool = require("../config/database");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/forgot", async (req, res) => {
  try {
    const { email } = req.body;
    const [users] = await pool.execute("SELECT id, name FROM users WHERE email = ?", [email]);
    if (!users.length) {
      return res.json({ message: "If an account with that email exists, a reset link has been sent" });
    }
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000);
    await pool.execute(
      "INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)",
      [users[0].id, token, expires]
    );
    res.json({ message: "If an account with that email exists, a reset link has been sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/reset", async (req, res) => {
  try {
    const { token, password } = req.body;
    const [rows] = await pool.execute(
      "SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW() AND used = FALSE",
      [token]
    );
    if (!rows.length) return res.status(400).json({ message: "Invalid or expired token" });
    const bcrypt = require("bcryptjs");
    const hashed = await bcrypt.hash(password, 10);
    await pool.execute("UPDATE users SET password = ? WHERE id = ?", [hashed, rows[0].user_id]);
    await pool.execute("UPDATE password_resets SET used = TRUE WHERE id = ?", [rows[0].id]);
    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/sessions", authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM user_sessions WHERE user_id = ? ORDER BY last_active DESC",
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/sessions/:id", authMiddleware, async (req, res) => {
  try {
    await pool.execute("DELETE FROM user_sessions WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/templates", authMiddleware, async (req, res) => {
  try {
    const { name, description, problem_type, priority, department_id, default_title, default_description } = req.body;
    const [result] = await pool.execute(
      "INSERT INTO ticket_templates (name, description, problem_type, priority, department_id, default_title, default_description, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [name, description || null, problem_type, priority || "medium", department_id || null, default_title || null, default_description || null, req.user.id]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/templates", authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT t.*, u.name as creator_name, d.name as department_name FROM ticket_templates t LEFT JOIN users u ON t.created_by = u.id LEFT JOIN departments d ON t.department_id = d.id ORDER BY t.created_at DESC"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/templates/:id", authMiddleware, async (req, res) => {
  try {
    await pool.execute("DELETE FROM ticket_templates WHERE id = ? AND created_by = ?", [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/tickets/bulk-update", authMiddleware, async (req, res) => {
  try {
    const { ticket_ids, action, status, assign_to } = req.body;
    if (!ticket_ids?.length) return res.status(400).json({ message: "No tickets selected" });
    
    if (action === "status" && status) {
      await pool.execute(
        "UPDATE tickets SET status = ?, updated_at = NOW() WHERE id IN (?)",
        [status, ticket_ids]
      );
    } else if (action === "assign" && assign_to) {
      await pool.execute(
        "UPDATE tickets SET current_handler_id = ?, status = 'pending', updated_at = NOW() WHERE id IN (?)",
        [assign_to, ticket_ids]
      );
    }
    res.json({ updated: ticket_ids.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/tickets/:id/merge", authMiddleware, async (req, res) => {
  try {
    const { target_ticket_id, reason } = req.body;
    await pool.execute(
      "INSERT INTO ticket_merges (source_ticket_id, target_ticket_id, merged_by, reason) VALUES (?, ?, ?, ?)",
      [req.params.id, target_ticket_id, req.user.id, reason || null]
    );
    await pool.execute(
      "UPDATE tickets SET status = 'closed' WHERE id = ?",
      [req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/tickets/:id/rate", authMiddleware, async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    if (rating < 1 || rating > 5) return res.status(400).json({ message: "Rating must be 1-5" });
    await pool.execute(
      "INSERT INTO ticket_ratings (ticket_id, user_id, rating, feedback) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE rating = ?, feedback = ?",
      [req.params.id, req.user.id, rating, feedback || null, rating, feedback || null]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/tickets/:id/rating", authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM ticket_ratings WHERE ticket_id = ?",
      [req.params.id]
    );
    res.json(rows[0] || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
