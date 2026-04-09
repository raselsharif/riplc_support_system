const db = require("../config/database");

class UserMessage {
  static async ensureTable() {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        message TEXT NULL,
        file_url VARCHAR(512) NULL,
        file_name VARCHAR(255) NULL,
        file_type VARCHAR(100) NULL,
        read_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_pair (sender_id, receiver_id),
        INDEX idx_receiver_read (receiver_id, read_at)
      )
    `);

    // Backfill columns for older installs in a MySQL/MariaDB compatible way
    const [cols] = await db.execute(
      `SELECT COLUMN_NAME, IS_NULLABLE
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_messages'`,
    );
    const byName = new Map(cols.map((c) => [c.COLUMN_NAME, c]));

    if (!byName.has("file_url")) {
      await db.execute(
        `ALTER TABLE user_messages ADD COLUMN file_url VARCHAR(512) NULL`,
      );
    }
    if (!byName.has("file_name")) {
      await db.execute(
        `ALTER TABLE user_messages ADD COLUMN file_name VARCHAR(255) NULL`,
      );
    }
    if (!byName.has("file_type")) {
      await db.execute(
        `ALTER TABLE user_messages ADD COLUMN file_type VARCHAR(100) NULL`,
      );
    }

    const messageCol = byName.get("message");
    if (messageCol && String(messageCol.IS_NULLABLE).toUpperCase() === "NO") {
      await db.execute(
        `ALTER TABLE user_messages MODIFY COLUMN message TEXT NULL`,
      );
    }
  }

  static async create(
    senderId,
    receiverId,
    message,
    fileUrl = null,
    fileName = null,
    fileType = null,
  ) {
    await this.ensureTable();
    const [res] = await db.execute(
      "INSERT INTO user_messages (sender_id, receiver_id, message, file_url, file_name, file_type) VALUES (?, ?, ?, ?, ?, ?)",
      [senderId, receiverId, message, fileUrl, fileName, fileType],
    );
    return res.insertId;
  }

  static async findThread(userId, otherId, limit = 100) {
    await this.ensureTable();
    const safeLimit = Number(limit) > 0 ? Number(limit) : 100;
    const [rows] = await db.execute(
      `SELECT m.*, s.name as sender_name, r.name as receiver_name
       FROM user_messages m
       JOIN users s ON m.sender_id = s.id
       JOIN users r ON m.receiver_id = r.id
       WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
       ORDER BY m.created_at DESC
       LIMIT ${safeLimit}`,
      [userId, otherId, otherId, userId],
    );
    return rows.reverse();
  }

  static async markRead(ids, readerId) {
    if (!ids.length) return;
    await this.ensureTable();
    const placeholders = ids.map(() => "?").join(", ");
    await db.execute(
      `UPDATE user_messages SET read_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders}) AND receiver_id = ?`,
      [...ids, readerId],
    );
  }

  static async unreadCount(receiverId) {
    await this.ensureTable();
    const [rows] = await db.execute(
      "SELECT COUNT(*) as cnt FROM user_messages WHERE receiver_id = ? AND read_at IS NULL",
      [receiverId],
    );
    return rows[0]?.cnt || 0;
  }

  static async unreadCountBySender(receiverId, senderId) {
    await this.ensureTable();
    const [rows] = await db.execute(
      "SELECT COUNT(*) as cnt FROM user_messages WHERE receiver_id = ? AND sender_id = ? AND read_at IS NULL",
      [receiverId, senderId],
    );
    return rows[0]?.cnt || 0;
  }
}

module.exports = UserMessage;
