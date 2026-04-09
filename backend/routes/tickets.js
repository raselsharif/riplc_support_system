const express = require("express");
const TicketController = require("../controllers/TicketController");
const authMiddleware = require("../middleware/auth");
const roleMiddleware = require("../middleware/role");
const {
  validate,
  ticketSchema,
  statusUpdateSchema,
  approvalSchema,
} = require("../middleware/validation");
const upload = require("../middleware/upload");

const router = express.Router();

router.use(authMiddleware);

router.post("/", validate(ticketSchema), TicketController.create);
router.get("/", TicketController.getAll);
router.get("/:id", TicketController.getById);
router.patch(
  "/:id/status",
  roleMiddleware("admin", "it", "underwriting", "mis"),
  validate(statusUpdateSchema),
  TicketController.updateStatus,
);
router.post("/:id/reply", TicketController.addReply);
router.post(
  "/:id/approve",
  roleMiddleware("underwriting", "mis"),
  validate(approvalSchema),
  TicketController.approve,
);
router.post(
  "/:id/reject",
  roleMiddleware("underwriting", "mis"),
  validate(approvalSchema),
  TicketController.reject,
);
router.post("/:id/upload", upload.array("file", 5), TicketController.upload);
router.delete("/:id", roleMiddleware("admin", "it"), TicketController.delete);

module.exports = router;
