const db = require("../config/database");
const UserMessage = require("../models/UserMessage");
const User = require("../models/User");

class MessageService {
  static isOnline(lastSeen) {
    if (!lastSeen) return false;
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() - new Date(lastSeen).getTime() <= fiveMinutes;
  }

  static async sendMessage(senderId, receiverId, message, file) {
    const receiver = await User.findById(receiverId);
    if (!receiver) throw new Error("Receiver not found");
    const text = (message || "").trim();
    let fileUrl = null;
    let fileName = null;
    let fileType = null;

    if (!text && !file) {
      throw new Error("Message or file required");
    }

    if (file) {
      const cloudinary = require("../config/cloudinary");
      const dataUri = `data:${file.mimetype};base64,${Buffer.from(file.buffer).toString("base64")}`;
      const uploadResult = await cloudinary.uploader.upload(dataUri, {
        folder: "support_messages",
        resource_type: "auto",
      });
      fileUrl = uploadResult.secure_url;
      fileName = file.originalname;
      fileType = file.mimetype;
    }

    const id = await UserMessage.create(
      senderId,
      receiverId,
      text,
      fileUrl,
      fileName,
      fileType,
    );
    const thread = await UserMessage.findThread(senderId, receiverId, 1);
    return thread[0];
  }

  static async getThread(userId, otherId) {
    return UserMessage.findThread(userId, otherId, 50);
  }

  static async markRead(messageIds, readerId) {
    return UserMessage.markRead(messageIds, readerId);
  }

  static async getContacts(currentUserId) {
    const contacts = await User.findAll();
    const activeContacts = contacts.filter(
      (u) => u.id !== currentUserId && u.is_active !== false,
    );

    const [unreadRows] = await db.execute(
      `SELECT sender_id, COUNT(*) AS cnt
       FROM user_messages
       WHERE receiver_id = ? AND read_at IS NULL
       GROUP BY sender_id`,
      [currentUserId],
    );

    const unreadMap = new Map(
      unreadRows.map((row) => [row.sender_id, row.cnt]),
    );

    // Get last message timestamp for each contact
    const [lastMessageRows] = await db.execute(
      `SELECT 
        CASE 
          WHEN sender_id = ? THEN receiver_id 
          ELSE sender_id 
        END AS contact_id,
        MAX(created_at) AS last_message_at
       FROM user_messages
       WHERE sender_id = ? OR receiver_id = ?
       GROUP BY contact_id`,
      [currentUserId, currentUserId, currentUserId],
    );

    const lastMessageMap = new Map(
      lastMessageRows.map((row) => [row.contact_id, row.last_message_at]),
    );

    const contactsWithLastMessage = activeContacts.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      role: u.role,
      branch_name: u.branch_name || null,
      is_online: MessageService.isOnline(u.last_seen),
      last_seen: u.last_seen,
      profile_image_url: u.profile_image_url || null,
      unread_count: Number(unreadMap.get(u.id) || 0),
      last_message_at: lastMessageMap.get(u.id) || null,
    }));

    // Sort by last message timestamp (most recent first), then by name
    return contactsWithLastMessage.sort((a, b) => {
      if (a.last_message_at && b.last_message_at) {
        return new Date(b.last_message_at) - new Date(a.last_message_at);
      }
      if (a.last_message_at && !b.last_message_at) return -1;
      if (!a.last_message_at && b.last_message_at) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  static async unreadCount(userId) {
    return UserMessage.unreadCount(userId);
  }
}

module.exports = MessageService;
