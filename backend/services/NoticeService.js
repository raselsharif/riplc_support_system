const Notice = require("../models/Notice");

class NoticeService {
  static async createNotice(data) {
    const id = await Notice.create(data);
    return Notice.findById(id);
  }

  static async getAllNotices(page = 1, limit = 9) {
    return Notice.findAll(page, limit);
  }

  static async getNoticeById(id) {
    const notice = await Notice.findById(id);
    if (!notice) throw new Error("Notice not found");
    return notice;
  }

  static async updateNotice(id, data) {
    const updated = await Notice.update(id, data);
    if (!updated) throw new Error("Notice not found");
    return Notice.findById(id);
  }

  static async deleteNotice(id) {
    const deleted = await Notice.delete(id);
    if (!deleted) throw new Error("Notice not found");
    return { message: "Notice deleted successfully" };
  }

  static async getLatestActiveNotice() {
    return Notice.getLatestActiveNotice();
  }

  static async getPopupSetting() {
    return Notice.getPopupSetting();
  }

  static async setPopupSetting(enabled) {
    return Notice.setPopupSetting(enabled);
  }
}

module.exports = NoticeService;
