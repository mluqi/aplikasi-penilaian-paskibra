const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Pastikan direktori tujuan ada, jika tidak maka buat direktori tersebut
const storagePath = path.join(__dirname, "..", "uploads", "users");
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, storagePath);
  },
  filename: function (req, file, cb) {
    // Buat nama file yang unik untuk menghindari konflik penamaan
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  // Hanya izinkan file dengan tipe gambar (image)
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file gambar yang diizinkan!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // Batas ukuran file 5MB
  },
});

module.exports = upload;
