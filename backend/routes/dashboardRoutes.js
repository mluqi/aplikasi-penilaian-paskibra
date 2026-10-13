const express = require("express");
const router = express.Router();
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const {
  getSummary,
  getEventStats,
  getJuriSummary,
} = require("../controllers/dashboardController");

// Semua rute di bawah ini memerlukan token
router.use(verifyToken);

router.get("/summary", authorizeRoles("superadmin", "admin"), getSummary);
router.get(
  "/event-stats",
  authorizeRoles("superadmin", "admin"),
  getEventStats,
);
router.get(
  "/juri-summary",
  authorizeRoles("juri", "superadmin", "admin", "asisten_juri"),
  getJuriSummary,
);

module.exports = router;
