// In-memory typing indicator store with short TTL (seconds)
const TTL_MS = 10000;
const store = new Map(); // key: `${senderId}->${receiverId}` => expiresAt

class TypingService {
  static setTyping(senderId, receiverId, isTyping) {
    const key = `${senderId}->${receiverId}`;
    if (isTyping) {
      store.set(key, Date.now() + TTL_MS);
    } else {
      store.delete(key);
    }
  }

  static isTyping(senderId, receiverId) {
    const key = `${senderId}->${receiverId}`;
    const expires = store.get(key);
    if (!expires) {
      return false;
    }
    if (Date.now() > expires) {
      store.delete(key);
      return false;
    }
    return true;
  }
}

module.exports = TypingService;
