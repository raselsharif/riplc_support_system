const AuthService = require('../services/AuthService');
const UserService = require('../services/UserService');
const User = require('../models/User');
const ActivityLogService = require('../services/ActivityLogService');
const pool = require('../config/database');

class AuthController {
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      const result = await AuthService.login({ username, password });

      const realIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || null;
      const socketIp = req.socket?.remoteAddress || req.ip || null;
      const ip = realIp || socketIp || 'unknown';
      const ua = req.headers['user-agent'] || '';
      try {
        const [insertResult] = await pool.execute(
          "INSERT INTO user_sessions (user_id, token, ip_address, user_agent) VALUES (?, ?, ?, ?)",
          [result.user.id, result.token, ip, ua]
        );
      } catch (err) {
        console.error("Failed to create session record:", err.message);
      }

      ActivityLogService.log({
        user_id: result.user.id,
        action: "login",
        entity_type: "user",
        entity_id: result.user.id,
        details: `User ${result.user.name} logged in | real_ip: ${realIp || 'n/a'} | local_ip: ${socketIp || 'n/a'} | user_agent: ${ua}`,
        client_ip: ip,
      }).catch(() => {});

      res.json(result);
    } catch (error) {
      const status = error.message.includes('disabled') ? 403 : 401;
      res.status(status).json({ message: error.message });
    }
  }

  static async refresh(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
      }

      const result = await AuthService.refresh(refreshToken);
      res.json(result);
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }

  static async register(req, res) {
    try {
      const { name, username, email, password, branch_id, branch_ids } = req.body;

      if (!name || !username || !password) {
        return res.status(400).json({ message: 'Name, username and password are required' });
      }

      const user = await UserService.createUser({
        name,
        username,
        email,
        password,
        role: 'user',
        branch_id: branch_id ? parseInt(branch_id, 10) : null,
        branch_ids: branch_ids ? branch_ids.map((b) => parseInt(b, 10)) : undefined
      });

      const token = AuthService.generateToken({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        branch_id: user.branch_id,
        department_id: user.department_id
      });

      const refreshToken = await AuthService.generateRefreshToken(user.id);

      res.status(201).json({
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          branch_id: user.branch_id,
          branch_name: user.branch_name,
          branch_ids: user.branch_ids || [],
          branches: user.branches || [],
          department_id: user.department_id,
          department_name: user.department_name,
          profile_image_url: user.profile_image_url
        },
        token,
        refreshToken
      });
    } catch (error) {
      const status = error.message === 'Email already registered' ? 409 : 500;
      res.status(status).json({ message: error.message });
    }
  }

  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current and new password are required' });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isValid = await User.verifyPassword(currentPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      await User.updatePassword(req.user.id, newPassword);
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async logout(req, res) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

      if (!token) {
        return res.status(400).json({ message: 'No token provided' });
      }

      // Remove persisted session (if present)
      await pool.execute("DELETE FROM user_sessions WHERE token = ?", [token]);

      // Log activity asynchronously
      ActivityLogService.log({
        user_id: req.user.id,
        action: "logout",
        entity_type: "user",
        entity_id: req.user.id,
        details: `User ${req.user.username || req.user.id} logged out`,
        client_ip: req.clientIP || ip,
      }).catch(() => {});

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = AuthController;
