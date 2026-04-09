const express = require("express");
const NoticeController = require("../controllers/NoticeController");
const authMiddleware = require("../middleware/auth");
const roleMiddleware = require("../middleware/role");
const { validate, noticeSchema, popupSettingSchema } = require("../middleware/validation");
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

router.use(authMiddleware);

router.get("/", NoticeController.getAll);
router.get("/latest", NoticeController.getLatest);
router.get("/popup-setting", NoticeController.getPopupSetting);
router.get("/:id", NoticeController.getById);

const processFiles = async (req, res, next) => {
  try {
    if (req.files && req.files.length > 0) {
      const uploadedFiles = [];
      for (const file of req.files) {
        const ext = file.originalname.split(".").pop();
        const publicId = `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, "")}`;
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: "image",
              public_id: publicId,
              folder: "notices",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(file.buffer);
        });

        uploadedFiles.push({
          file_url: result.secure_url,
          public_id: result.public_id,
          file_name: file.originalname,
          file_type: "image",
          file_size: file.size,
        });
      }

      if (uploadedFiles.length > 0) {
        const first = uploadedFiles[0];
        req.body.file_url = first.file_url;
        req.body.public_id = first.public_id;
        req.body.file_name = first.file_name;
        req.body.file_type = first.file_type;
        req.body.file_size = first.file_size;
      }
    }
    next();
  } catch (error) {
    console.error("Notice file upload error:", error);
    res.status(500).json({ message: "File upload failed: " + error.message });
  }
};

router.post(
  "/",
  roleMiddleware("admin", "it"),
  upload.array("file", 5),
  processFiles,
  validate(noticeSchema),
  NoticeController.create
);

router.put(
  "/:id",
  roleMiddleware("admin", "it"),
  upload.array("file", 5),
  processFiles,
  validate(noticeSchema),
  NoticeController.update
);

router.delete("/:id", roleMiddleware("admin", "it"), NoticeController.delete);

router.post(
  "/popup-setting",
  roleMiddleware("admin", "it"),
  validate(popupSettingSchema),
  NoticeController.setPopupSetting
);

module.exports = router;
