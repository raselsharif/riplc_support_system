const express = require("express");
const pool = require("../config/database");
const authMiddleware = require("../middleware/auth");
const roleMiddleware = require("../middleware/role");

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 50, category } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let query = "SELECT * FROM knowledge_base WHERE is_published = 1";
    const params = [];
    if (category && category !== "All") {
      query += " AND category = ?";
      params.push(category);
    }
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);

    const [rows] = await pool.query(query, params);
    const [countRows] = await pool.query(
      "SELECT COUNT(*) as total FROM knowledge_base WHERE is_published = 1"
    );
    res.json({ articles: rows, total: countRows[0].total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ articles: [] });
    const [rows] = await pool.query(
      "SELECT * FROM knowledge_base WHERE is_published = 1 AND (title LIKE ? OR content LIKE ? OR tags LIKE ?) ORDER BY views DESC LIMIT 20",
      [`%${q}%`, `%${q}%`, `%${q}%`]
    );
    res.json({ articles: rows });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM knowledge_base WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: "Article not found" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", roleMiddleware("admin", "it"), async (req, res) => {
  try {
    const { title, content, category, tags, is_published } = req.body;
    const [result] = await pool.execute(
      "INSERT INTO knowledge_base (title, content, category, tags, is_published, created_by) VALUES (?, ?, ?, ?, ?, ?)",
      [title, content, category, tags || null, is_published ? 1 : 0, req.user.id]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id/view", async (req, res) => {
  try {
    await pool.execute("UPDATE knowledge_base SET views = views + 1 WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", roleMiddleware("admin", "it"), async (req, res) => {
  try {
    const { title, content, category, tags, is_published } = req.body;
    await pool.execute(
      "UPDATE knowledge_base SET title = ?, content = ?, category = ?, tags = ?, is_published = ? WHERE id = ?",
      [title, content, category, tags || null, is_published ? 1 : 0, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", roleMiddleware("admin", "it"), async (req, res) => {
  try {
    await pool.execute("DELETE FROM knowledge_base WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
