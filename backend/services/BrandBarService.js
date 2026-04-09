const BrandBar = require("../models/BrandBar");

class BrandBarService {
  static async getSettings() {
    return BrandBar.getSettings();
  }

  static async updateSettings(data) {
    return BrandBar.updateSettings(data);
  }
}

module.exports = BrandBarService;
