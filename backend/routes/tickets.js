const express = require("express");
const multer = require("multer");
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

// Simple upload with .single() instead of .array()
const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    console.log("File filter:", { mimetype: file.mimetype, originalname: file.originalname });
    cb(null, true);
  }
});

router.post("/:id/upload", uploadMiddleware.single("file"), (req, res) => {
  console.log("Upload request received:", { 
    params: req.params, 
    file: req.file,
    body: req.body 
  });
  
  if (!req.file) {
    console.log("No file in request");
    return res.status(400).json({ message: "No file uploaded" });
  }
  
  TicketController.upload(req, res);
});

router.delete("/:id", roleMiddleware("admin", "it"), TicketController.delete);

module.exports = router;
