const ActivityLog = require("../models/ActivityLog");

class ActivityLogService {
  static async log(data) {
    return ActivityLog.create(data);
  }

  static async findAll(params) {
    return ActivityLog.findAll(params);
  }

  static async getStats() {
    return ActivityLog.getStats();
  }

  static async findById(id) {
    return ActivityLog.findById(id);
  }
}

module.exports = ActivityLogService;
