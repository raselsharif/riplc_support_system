const User = require('../models/User');
const bcrypt = require('bcryptjs');

class UserService {
  static async createUser({ name, username, email, password, role, department_id, branch_id, branch_ids, profile_image_url }) {
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      throw new Error('Username already registered');
    }

    if (email) {
      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        throw new Error('Email already registered');
      }
    }

    const primaryBranch = branch_id || (branch_ids && branch_ids.length ? branch_ids[0] : null);
    const userId = await User.create({ name, username, email, password, role, department_id, branch_id: primaryBranch, profile_image_url });
    const toAssign = branch_ids?.length ? branch_ids : primaryBranch ? [primaryBranch] : [];
    if (toAssign.length) {
      await UserService.setUserBranches(userId, toAssign);
    }
    return UserService.getUserById(userId);
  }

  static async getAllUsers(filters = {}) {
    const users = await User.findAll(filters);
    const withBranches = await UserService.attachBranches(users);
    return withBranches.map(UserService.addOnlineFlag);
  }

  static async getUserById(id) {
    const user = await User.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    const [withBranches] = await UserService.attachBranches([user]);
    return UserService.addOnlineFlag(withBranches);
  }

  static async deleteUser(id) {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');
    if (user.username === 'admin') throw new Error('Super admin cannot be deleted');
    const db = require('../config/database');
    const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);
    if (!result.affectedRows) throw new Error('User not found');
    return true;
  }

  static async updatePasswordAdmin(id, password) {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');
    await User.updatePassword(id, password);
    return true;
  }

  static async uploadProfileImage(id, file, actor) {
    const numericId = parseInt(id, 10);
    const isAdmin = actor.role === 'admin';
    const isSelf = actor.id === numericId;
    if (!isAdmin && !isSelf) {
      throw new Error('Not authorized to update this user');
    }

    const cloudinary = require('../config/cloudinary');
    const dataUri = `data:${file.mimetype};base64,${Buffer.from(file.buffer).toString('base64')}`;
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      resource_type: 'image',
      folder: 'support_profiles',
      public_id: `user_${numericId}_${Date.now()}`
    });

    await User.update(id, { profile_image_url: uploadResult.secure_url });
    const user = await User.findById(id);
    const [withBranches] = await UserService.attachBranches([user]);
    return UserService.addOnlineFlag(withBranches);
  }

  static async updateUserStatus(id, isActive) {
    const updated = await User.updateStatus(id, isActive);
    if (!updated) {
      throw new Error('User not found');
    }
    const user = await User.findById(id);
    const [withBranches] = await UserService.attachBranches([user]);
    return UserService.addOnlineFlag(withBranches);
  }

  static async attachBranches(users) {
    if (!users || users.length === 0) return [];
    const ids = users.map(u => u.id);
    const placeholders = ids.map(() => '?').join(', ');
    const [rows] = await require('../config/database').execute(
      `SELECT ub.user_id, ub.branch_id, b.name, b.code FROM user_branches ub JOIN branches b ON ub.branch_id = b.id WHERE ub.user_id IN (${placeholders})`,
      ids
    );
    return users.map(u => {
      const branches = rows.filter(r => r.user_id === u.id);
      return {
        ...u,
        branch_ids: branches.map(b => b.branch_id),
        branches: branches.map(b => ({ id: b.branch_id, name: b.name, code: b.code, branch_code: b.code }))
      };
    });
  }

  static async updateUser(id, payload, actor) {
    const numericId = parseInt(id, 10);
    const isSelf = actor.id === numericId;
    const isAdmin = actor.role === 'admin';

    if (!isAdmin && !isSelf) {
      throw new Error('Not authorized to update this user');
    }

    if (!isAdmin) {
      // Regular users cannot modify privileged fields
      ['role', 'is_active', 'department_id', 'branch_id'].forEach((f) => {
        if (payload[f] !== undefined) {
          delete payload[f];
        }
      });
    }

    if (payload.username) {
      const existing = await User.findByUsername(payload.username);
      if (existing && existing.id !== numericId) {
        throw new Error('Username already registered');
      }
    }

    if (payload.email) {
      const existingEmail = await User.findByEmail(payload.email);
      if (existingEmail && existingEmail.id !== numericId) {
        throw new Error('Email already registered');
      }
    }

    const updated = await User.update(id, payload);
    if (!updated) {
      throw new Error('User not found');
    }
    if (payload.branch_ids) {
      await UserService.setUserBranches(id, payload.branch_ids);
    } else if (payload.branch_id !== undefined) {
      const current = await UserService.getBranchAssignments(id).catch(() => ({ assignedBranches: [] }));
      const extra = current.assignedBranches?.map((b) => b.id) || [];
      const primary = payload.branch_id || null;
      const branchesToSet = primary ? [primary, ...extra.filter((id) => id !== primary)] : extra;
      if (branchesToSet.length) {
        await UserService.setUserBranches(id, branchesToSet);
      }
    }
    return UserService.getUserById(id);
  }

  static addOnlineFlag(user) {
    if (!user) return user;
    const lastSeen = user.last_seen ? new Date(user.last_seen).getTime() : 0;
    const fiveMinutes = 5 * 60 * 1000;
    user.is_online = lastSeen && (Date.now() - lastSeen) <= fiveMinutes;
    return user;
  }

  static async getBranchStats() {
    return User.countByBranch();
  }

  static async setUserBranches(userId, branchIds) {
    const db = require('../config/database');
    const cleanIds = Array.from(new Set((branchIds || []).map((b) => Number(b)).filter((b) => !!b)));
    await db.execute('DELETE FROM user_branches WHERE user_id = ?', [userId]);
    if (!cleanIds.length) return;

    const placeholders = cleanIds.map(() => '(?, ?)').join(', ');
    const flat = cleanIds.flatMap((bid) => [userId, bid]);
    await db.execute(`INSERT INTO user_branches (user_id, branch_id) VALUES ${placeholders}`, flat);
  }

  static async getBranchAssignments(userId) {
    const db = require('../config/database');
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Home branch (primary)
    const [homeRows] = await db.execute('SELECT id, name, code FROM branches WHERE id = ?', [user.branch_id]);
    const homeBranch = homeRows[0] || null;

    // Assigned branches (including primary stored in user_branches)
    const [assignedRows] = await db.execute(
      'SELECT b.id, b.name, b.code FROM user_branches ub JOIN branches b ON ub.branch_id = b.id WHERE ub.user_id = ? ORDER BY b.name',
      [userId]
    );

    // Remaining branches = active branches not assigned and not home
    const [allRows] = await db.execute('SELECT id, name, code FROM branches WHERE is_active = TRUE');
    const assignedIds = new Set(assignedRows.map((b) => b.id));
    const remainingBranches = allRows.filter((b) => !assignedIds.has(b.id) && b.id !== user.branch_id);

    return {
      homeBranch: homeBranch ? { ...homeBranch, branch_code: homeBranch.code } : null,
      assignedBranches: assignedRows.filter((b) => b.id !== user.branch_id).map((b) => ({ ...b, branch_code: b.code })),
      remainingBranches: remainingBranches.map((b) => ({ ...b, branch_code: b.code }))
    };
  }

  static async updateBranchAssignments(userId, assignedBranchIds = [], actor) {
    const numericId = parseInt(userId, 10);
    const allowedRoles = ['admin', 'mis', 'underwriting'];
    const actorRole = (actor.role || '').toString().toLowerCase();
    if (!allowedRoles.includes(actorRole)) {
      throw new Error('Not authorized to update branches');
    }
    if (actorRole !== 'admin' && actor.id !== numericId) {
      throw new Error('Not authorized to update this user');
    }

    const user = await User.findById(numericId);
    if (!user) throw new Error('User not found');

    // Clean payload: remove duplicates, remove home branch if present
    let uniqueAssigned = Array.from(new Set(assignedBranchIds.map(Number))).filter(
      (bid) => bid && bid !== user.branch_id
    );

    // Verify branches exist
    if (uniqueAssigned.length) {
      const db = require('../config/database');
      const placeholders = uniqueAssigned.map(() => '?').join(', ');
      const [rows] = await db.execute(`SELECT id FROM branches WHERE id IN (${placeholders})`, uniqueAssigned);
      const foundIds = rows.map((r) => r.id);
      // silently ignore missing to avoid breaking UX; DB FK will still protect integrity
      uniqueAssigned = uniqueAssigned.filter((id) => foundIds.includes(id));
    }

    const baseBranches = user.branch_id ? [user.branch_id, ...uniqueAssigned] : uniqueAssigned;
    await UserService.setUserBranches(numericId, baseBranches);
    return UserService.getBranchAssignments(numericId);
  }
}

module.exports = UserService;
