const ActivityLogService = require("../services/ActivityLogService");

class ActivityLogController {
  static async getLogs(req, res) {
    try {
      const { page, limit, user_id, entity_type, action, search, start_date, end_date } = req.query;
      const result = await ActivityLogService.findAll({
        page: page || 1,
        limit: limit || 20,
        user_id,
        entity_type,
        action,
        search,
        start_date,
        end_date,
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getStats(req, res) {
    try {
      const stats = await ActivityLogService.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const log = await ActivityLogService.findById(req.params.id);
      if (!log) return res.status(404).json({ message: "Activity log not found" });
      res.json(log);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = ActivityLogController;
