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
    let prefix = "file-";
    if (file.fieldname === "event_juknis") prefix = "juknis-";
    else if (file.fieldname === "event_poster") prefix = "poster-";
    else if (file.fieldname === "surat_rekomendasi") prefix = "surat-rekomendasi-";

    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "event_poster") {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file gambar yang diizinkan untuk poster!"), false);
    }
  } else if (file.fieldname === "event_juknis") {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype.includes("word") ||
      file.mimetype.includes("document")
    ) {
      cb(null, true);
    } else {
      cb(
        new Error("Hanya file PDF atau Dokumen yang diizinkan untuk Juknis!"),
        false,
      );
    }
  } else {
    cb(null, true);
  }
};

const uploadEventFiles = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 10 }, // Diperbesar menjadi 10MB untuk juknis
});

module.exports = uploadEventFiles;
