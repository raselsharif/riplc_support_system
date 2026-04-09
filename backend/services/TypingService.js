// In-memory typing indicator store with short TTL (seconds)
const TTL_MS = 10000;
const store = new Map(); // key: `${senderId}->${receiverId}` => expiresAt

class TypingService {
  static setTyping(senderId, receiverId, isTyping) {
    const key = `${senderId}->${receiverId}`;
    if (isTyping) {
      store.set(key, Date.now() + TTL_MS);
      console.log(
        `Typing: ${senderId} -> ${receiverId} (expires: ${new Date(Date.now() + TTL_MS).toISOString()})`,
      );
    } else {
      store.delete(key);
      console.log(`Stopped typing: ${senderId} -> ${receiverId}`);
    }
  }

  static isTyping(senderId, receiverId) {
    const key = `${senderId}->${receiverId}`;
    const expires = store.get(key);
    if (!expires) {
      console.log(`Not typing: ${senderId} -> ${receiverId} (no entry)`);
      return false;
    }
    if (Date.now() > expires) {
      store.delete(key);
      console.log(`Expired typing: ${senderId} -> ${receiverId}`);
      return false;
    }
    console.log(`Still typing: ${senderId} -> ${receiverId}`);
    return true;
  }
}

module.exports = TypingService;
