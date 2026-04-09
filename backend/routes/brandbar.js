const express = require("express");
const BrandBarController = require("../controllers/BrandBarController");
const authMiddleware = require("../middleware/auth");
const roleMiddleware = require("../middleware/role");
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

router.get("/", BrandBarController.getSettings);
router.get("/weather", BrandBarController.getWeather);

const processLogo = async (req, res, next) => {
  try {
    if (req.file) {
      const isImage = req.file.mimetype.startsWith("image/");
      const publicId = `brandbar-logo-${Date.now()}`;
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            public_id: publicId,
            folder: "brandbar",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      req.body.logo_url = result.secure_url;
      req.body.logo_public_id = result.public_id;
    }
    next();
  } catch (error) {
    console.error("Brandbar logo upload error:", error);
    res.status(500).json({ message: "Logo upload failed: " + error.message });
  }
};

router.post(
  "/",
  roleMiddleware("admin", "it"),
  upload.single("logo"),
  processLogo,
  BrandBarController.updateSettings
);

module.exports = router;
