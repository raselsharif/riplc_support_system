const express = require("express");
const speakeasy = require("speakeasy");
const pool = require("../config/database");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

router.post("/enable", async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({ name: `Support System (${req.user.username})` });
    await pool.execute(
      "UPDATE users SET totp_secret = ?, totp_enabled = 0 WHERE id = ?",
      [secret.base32, req.user.id]
    );
    res.json({ secret: secret.base32, otpauth_url: secret.otpauth_url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const { token } = req.body;
    const [rows] = await pool.execute("SELECT totp_secret FROM users WHERE id = ?", [req.user.id]);
    if (!rows.length || !rows[0].totp_secret) {
      return res.status(400).json({ message: "2FA not initiated" });
    }
    const verified = speakeasy.totp.verify({
      secret: rows[0].totp_secret,
      encoding: "base32",
      token,
      window: 2,
    });
    if (!verified) return res.status(400).json({ message: "Invalid token" });
    await pool.execute("UPDATE users SET totp_enabled = 1 WHERE id = ?", [req.user.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/disable", async (req, res) => {
  try {
    const { token } = req.body;
    const [rows] = await pool.execute("SELECT totp_secret FROM users WHERE id = ?", [req.user.id]);
    if (!rows.length || !rows[0].totp_secret) {
      return res.status(400).json({ message: "2FA not enabled" });
    }
    const verified = speakeasy.totp.verify({
      secret: rows[0].totp_secret,
      encoding: "base32",
      token,
      window: 2,
    });
    if (!verified) return res.status(400).json({ message: "Invalid token" });
    await pool.execute("UPDATE users SET totp_enabled = 0, totp_secret = NULL WHERE id = ?", [req.user.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/status", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT totp_enabled FROM users WHERE id = ?", [req.user.id]);
    res.json({ enabled: rows[0]?.totp_enabled === 1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
