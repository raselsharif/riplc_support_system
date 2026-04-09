const express = require("express");
const authMiddleware = require("../middleware/auth");
const MessageController = require("../controllers/MessageController");
const upload = require("../middleware/upload");

const router = express.Router();
router.use(authMiddleware);

router.get("/contacts", MessageController.contacts);
router.get("/thread/:userId", MessageController.thread);
router.get("/unread-count", MessageController.unreadCount);
router.post("/", upload.single("file"), MessageController.send);
router.patch("/read", MessageController.markRead);
router.post("/typing", MessageController.typing);
router.get("/typing/:userId", MessageController.typingStatus);

module.exports = router;
