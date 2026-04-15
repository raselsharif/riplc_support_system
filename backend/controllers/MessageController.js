const MessageService = require("../services/MessageService");
const TypingService = require("../services/TypingService");

class MessageController {
  static async contacts(req, res) {
    try {
      const list = await MessageService.getContacts(req.user.id);
      res.json(list);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async thread(req, res) {
    try {
      const data = await MessageService.getThread(
        req.user.id,
        req.params.userId,
      );
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async send(req, res) {
    try {
      const { receiver_id, message } = req.body;
      const msg = await MessageService.sendMessage(
        req.user.id,
        receiver_id,
        message,
        req.file,
      );
      TypingService.setTyping(req.user.id, receiver_id, false);
      res.status(201).json(msg);
    } catch (err) {
      const status = err.message === "Receiver not found" ? 404 : 400;
      res.status(status).json({ message: err.message });
    }
  }

  static async markRead(req, res) {
    try {
      const ids = req.body.ids || [];
      await MessageService.markRead(ids, req.user.id);
      res.json({ message: "ok" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async unreadCount(req, res) {
    try {
      const total = await MessageService.unreadCount(req.user.id);
      res.json({ total });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async typing(req, res) {
    try {
      const { to_user_id, is_typing } = req.body;
      TypingService.setTyping(req.user.id, Number(to_user_id), !!is_typing);
      res.json({ message: "ok" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async typingStatus(req, res) {
    try {
      const otherId = Number(req.params.userId);
      const typing = TypingService.isTyping(otherId, req.user.id);
      res.json({ user_id: otherId, is_typing: typing });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = MessageController;
