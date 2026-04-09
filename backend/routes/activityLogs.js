const express = require("express");
const ActivityLogController = require("../controllers/ActivityLogController");
const authMiddleware = require("../middleware/auth");
const roleMiddleware = require("../middleware/role");

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("admin"));

router.get("/stats", ActivityLogController.getStats);
router.get("/", ActivityLogController.getLogs);
router.get("/:id", ActivityLogController.getById);

module.exports = router;
