const TicketService = require('../services/TicketService');

class DashboardController {
  static async getBranchStats(req, res) {
    try {
      const branchId = req.query.branch_id ? parseInt(req.query.branch_id) : null;
      const stats = await TicketService.getBranchStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getStats(req, res) {
    try {
      const branchId = req.query.branch_id ? parseInt(req.query.branch_id) : null;
      const stats = await TicketService.getStats(branchId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = DashboardController;
