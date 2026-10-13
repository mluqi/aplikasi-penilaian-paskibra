const express = require("express");
const router = express.Router();
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const {
  getAktivitasLogs,
  getAksesLogs,
  getApiLogs,
} = require("../controllers/logController");

// Semua rute di bawah ini memerlukan token dan peran admin
router.use(verifyToken, authorizeRoles("superadmin","admin"));

router.get("/aktivitas", getAktivitasLogs);
router.get("/akses", getAksesLogs);
router.get("/api-log", getApiLogs);

module.exports = router;
