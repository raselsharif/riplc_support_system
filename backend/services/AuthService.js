const User = require('../models/User');
const jwt = require('jsonwebtoken');
const UserService = require('./UserService');
const pool = require('../config/database');

class AuthService {
  static async login({ username, password }) {
    const user = await User.findByUsername(username);

    if (!user) {
      throw new Error('Invalid username or password');
    }

    if (!user.is_active) {
      throw new Error('Account is disabled. Contact administrator.');
    }

    const isValid = await User.verifyPassword(password, user.password);
    if (!isValid) {
      throw new Error('Invalid username or password');
    }

    await User.updateLastLogin(user.id);
    await User.updateLastSeen(user.id);

    const [withBranches] = await UserService.attachBranches([user]);

    const token = this.generateToken({
      id: withBranches.id,
      username: withBranches.username,
      email: withBranches.email,
      role: withBranches.role,
      department_id: withBranches.department_id,
      branch_id: withBranches.branch_id
    });

    const refreshToken = await this.generateRefreshToken(withBranches.id);

    return {
      user: {
        id: withBranches.id,
        name: withBranches.name,
        username: withBranches.username,
        email: withBranches.email,
        role: withBranches.role,
        department_id: withBranches.department_id,
        department_name: withBranches.department_name,
        branch_id: withBranches.branch_id,
        branch_name: withBranches.branch_name,
        branch_ids: withBranches.branch_ids || [],
        branches: withBranches.branches || [],
        profile_image_url: withBranches.profile_image_url
      },
      token,
      refreshToken
    };
  }

  static generateToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    });
  }

  static generateRefreshToken(userId) {
    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

    const token = jwt.sign({ userId, type: 'refresh' }, refreshSecret, {
      expiresIn
    });

    const expiresAt = new Date(Date.now() + this.parseExpiresIn(expiresIn));

    pool.execute(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    ).catch(err => console.error('Failed to store refresh token:', err.message));

    return token;
  }

  static parseExpiresIn(expiresIn) {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000
    };

    return value * (multipliers[unit] || 1);
  }

  static async refresh(refreshToken) {
    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, refreshSecret);
    } catch (err) {
      throw new Error('Invalid or expired refresh token');
    }

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    const [rows] = await pool.execute(
      'SELECT * FROM refresh_tokens WHERE token = ? AND user_id = ? AND is_revoked = 0 AND expires_at > NOW()',
      [refreshToken, decoded.userId]
    );

    if (!rows.length) {
      throw new Error('Refresh token not found or expired');
    }

    await pool.execute('UPDATE refresh_tokens SET is_revoked = 1 WHERE token = ?', [refreshToken]);

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.is_active) {
      throw new Error('Account is disabled');
    }

    const [withBranches] = await UserService.attachBranches([user]);

    const newAccessToken = this.generateToken({
      id: withBranches.id,
      username: withBranches.username,
      email: withBranches.email,
      role: withBranches.role,
      department_id: withBranches.department_id,
      branch_id: withBranches.branch_id
    });

    const newRefreshToken = await this.generateRefreshToken(withBranches.id);

    return {
      token: newAccessToken,
      refreshToken: newRefreshToken
    };
  }
}

module.exports = AuthService;
