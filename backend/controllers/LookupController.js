const Department = require('../models/Department');
const Branch = require('../models/Branch');

class LookupController {
  static async getDepartments(req, res) {
    try {
      const departments = await Department.findAll();
      res.json(departments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getBranches(req, res) {
    try {
      const branches = await Branch.findAll();
      res.json(branches);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async createBranch(req, res) {
    try {
      const { name, branchCode, branch_code, code, address } = req.body;
      const resolvedCode = branchCode ?? branch_code ?? code;
      if (!name || resolvedCode === undefined || resolvedCode === null) {
        return res
          .status(400)
          .json({ message: "Name and branchCode are required" });
      }
      const numericCode = Number(resolvedCode);
      if (Number.isNaN(numericCode)) {
        return res
          .status(400)
          .json({ message: "branchCode must be a number" });
      }

      const branchId = await Branch.create({
        name,
        branch_code: numericCode,
        address,
      });
      const branch = await Branch.findById(branchId);
      res.status(201).json(branch);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async updateBranch(req, res) {
    try {
      const { name, branchCode, branch_code, code, address } = req.body;
      const resolvedCode = branchCode ?? branch_code ?? code;
      const branch = await Branch.findById(req.params.id);
      if (!branch) {
        return res.status(404).json({ message: 'Branch not found' });
      }
      let numericCode = branch.branch_code;
      if (resolvedCode !== undefined) {
        numericCode = Number(resolvedCode);
      }
      if (resolvedCode !== undefined && Number.isNaN(numericCode)) {
        return res
          .status(400)
          .json({ message: "branchCode must be a number" });
      }
      const updated = await Branch.updateById(req.params.id, {
        name,
        branch_code: numericCode,
        address,
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async deleteBranch(req, res) {
    try {
      const deleted = await Branch.softDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Branch not found" });
      }
      res.json({ message: "Branch deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = LookupController;
