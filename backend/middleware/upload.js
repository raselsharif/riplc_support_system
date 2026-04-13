const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only images (JPG, PNG, GIF, WEBP) are allowed.",
      ),
      false,
    );
  }
};

const limits = {
  fileSize: 2 * 1024 * 1024, // 2MB
};

const generateFilename = (file) => {
  const ext = path.extname(file.originalname);
  return `${uuidv4()}${ext}`;
};

const upload = multer({
  storage,
  fileFilter,
  limits,
  filename: generateFilename,
});

module.exports = upload;
