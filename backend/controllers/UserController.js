const UserService = require('../services/UserService');

class UserController {
  static async create(req, res) {
    try {
      const { name, username, email, password, role, department_id, branch_id, profile_image_url } = req.body;
      const user = await UserService.createUser({
        name,
        username,
        email,
        password,
        role: role || 'user',
        department_id,
        branch_id,
        branch_ids: req.body.branch_ids,
        profile_image_url
      });
      res.status(201).json(user);
    } catch (error) {
      const duplicate = ['Email already registered', 'Username already registered'].includes(error.message);
      const status = duplicate ? 409 : 500;
      res.status(status).json({ message: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const { role, department_id, branch_id, is_active, limit, offset } = req.query;
      const filters = {};

      if (role) filters.role = role;
      if (department_id) filters.department_id = parseInt(department_id);
      if (branch_id) filters.branch_id = parseInt(branch_id);
      if (is_active !== undefined) filters.is_active = is_active === 'true';
      if (limit) filters.limit = parseInt(limit);
      if (offset) filters.offset = parseInt(offset);

      const users = await UserService.getAllUsers(filters);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const user = await UserService.getUserById(req.params.id);
      res.json(user);
    } catch (error) {
      const status = error.message === 'User not found' ? 404 : 500;
      res.status(status).json({ message: error.message });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { is_active } = req.body;
      const user = await UserService.updateUserStatus(req.params.id, is_active);
      res.json(user);
    } catch (error) {
      const status = error.message === 'User not found' ? 404 : 500;
      res.status(status).json({ message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const payload = req.body;
      const user = await UserService.updateUser(req.params.id, payload, {
        id: req.user.id,
        role: req.user.role
      });
      res.json(user);
    } catch (error) {
      const badRequestMessages = [
        'User not found',
        'Only admin can change roles',
        'Username already registered',
        'Email already registered',
        'Not authorized to update this user'
      ];
      const status = badRequestMessages.includes(error.message) ? 400 : 500;
      res.status(status).json({ message: error.message });
    }
  }

  static async getBranches(req, res) {
    try {
      const data = await UserService.getBranchAssignments(req.params.id);
      res.json(data);
    } catch (error) {
      const status = ['User not found', 'Not authorized to update this user', 'Not authorized to update branches'].includes(error.message) ? 400 : 500;
      res.status(status).json({ message: error.message });
    }
  }

  static async updateBranches(req, res) {
    try {
      const payloadIds =
        req.body.assignedBranchIds ??
        req.body.assigned_branch_ids ??
        req.body.branch_ids ??
        [];

      const data = await UserService.updateBranchAssignments(req.params.id, payloadIds, {
        id: req.user.id,
        role: req.user.role
      });
      res.json(data);
    } catch (error) {
      const status = ['User not found', 'Not authorized to update this user', 'Not authorized to update branches', 'User has no home branch', 'One or more branches not found'].includes(error.message) ? 400 : 500;
      res.status(status).json({ message: error.message });
    }
  }

  static async delete(req, res) {
    try {
      await UserService.deleteUser(req.params.id);
      res.json({ message: 'User deleted' });
    } catch (error) {
      const status = ['User not found', 'Super admin cannot be deleted'].includes(error.message) ? 400 : 500;
      res.status(status).json({ message: error.message });
    }
  }

  static async adminChangePassword(req, res) {
    try {
      await UserService.updatePasswordAdmin(req.params.id, req.body.password);
      res.json({ message: 'Password updated' });
    } catch (error) {
      const status = error.message === 'User not found' ? 404 : 500;
      res.status(status).json({ message: error.message });
    }
  }

  static async uploadProfileImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      const user = await UserService.uploadProfileImage(req.params.id, req.file, req.user);
      res.status(201).json(user);
    } catch (error) {
      const status = ['User not found', 'Not authorized to update this user'].includes(error.message) ? 400 : 500;
      res.status(status).json({ message: error.message });
    }
  }
}

module.exports = UserController;
