const User = require('../models/User');
const jwt = require('jsonwebtoken');
const UserService = require('./UserService');

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
      token
    };
  }

  static generateToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  }
}

module.exports = AuthService;
