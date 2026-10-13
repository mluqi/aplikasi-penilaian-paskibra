const express = require("express");
const router = express.Router();
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const upload = require("../middlewares/fileMiddleware");
const { createJuri } = require("../controllers/juriController");

// Semua rute di bawah ini memerlukan token yang valid
router.use(verifyToken);

// Rute untuk menambahkan juri baru oleh koordinator event
router.post(
  "/",
  authorizeRoles("koordinator_event"),
  upload.single("user_photo"),
  createJuri,
);

module.exports = router;