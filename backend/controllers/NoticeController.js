const NoticeService = require("../services/NoticeService");

class NoticeController {
  static async create(req, res) {
    try {
      const { heading, detail, notice_date, notice_time, file_url, public_id, file_name, file_type, file_size } = req.body;
      const notice = await NoticeService.createNotice({
        heading,
        detail,
        notice_date,
        notice_time,
        file_url: file_url || null,
        public_id: public_id || null,
        file_name: file_name || null,
        file_type: file_type || null,
        file_size: file_size ? parseInt(file_size) : null,
        created_by: req.user.id,
      });
      await NoticeService.setPopupSetting(true);
      res.status(201).json(notice);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 9;
      const notices = await NoticeService.getAllNotices(page, limit);
      res.json(notices);
    } catch (error) {
      console.error("NoticeController.getAll error:", error.message);
      console.error("Full error:", error);
      res.status(500).json({ message: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const notice = await NoticeService.getNoticeById(req.params.id);
      res.json(notice);
    } catch (error) {
      const status = error.message === "Notice not found" ? 404 : 500;
      res.status(status).json({ message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { heading, detail, notice_date, notice_time, file_url, public_id, file_name, file_type, file_size } = req.body;
      const updateData = { heading, detail, notice_date, notice_time };
      if (file_url !== undefined) {
        updateData.file_url = file_url || null;
        updateData.public_id = public_id || null;
        updateData.file_name = file_name || null;
        updateData.file_type = file_type || null;
        updateData.file_size = file_size ? parseInt(file_size) : null;
      }
      const notice = await NoticeService.updateNotice(req.params.id, updateData);
      res.json(notice);
    } catch (error) {
      const status = error.message === "Notice not found" ? 404 : 500;
      res.status(status).json({ message: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const result = await NoticeService.deleteNotice(req.params.id);
      res.json(result);
    } catch (error) {
      const status = error.message === "Notice not found" ? 404 : 500;
      res.status(status).json({ message: error.message });
    }
  }

  static async getLatest(req, res) {
    try {
      const notice = await NoticeService.getLatestActiveNotice();
      res.json(notice);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getPopupSetting(req, res) {
    try {
      const setting = await NoticeService.getPopupSetting();
      const popupEnabled = setting?.popup_enabled ?? true;

      if (popupEnabled) {
        const latestNotice = await NoticeService.getLatestActiveNotice();
        if (!latestNotice) {
          await NoticeService.setPopupSetting(false);
          return res.json({ popup_enabled: false });
        }
      }

      res.json({ popup_enabled: popupEnabled });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async setPopupSetting(req, res) {
    try {
      const { enabled } = req.body;
      const setting = await NoticeService.setPopupSetting(enabled);
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = NoticeController;
