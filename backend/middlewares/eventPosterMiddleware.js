const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Pastikan direktori tujuan ada, jika tidak maka buat direktori tersebut
const storagePath = path.join(__dirname, "..", "uploads", "events");
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, storagePath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "poster-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file gambar yang diizinkan!"), false);
  }
};

const uploadEventPoster = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 },
}); // Batas 5MB

module.exports = uploadEventPoster;
