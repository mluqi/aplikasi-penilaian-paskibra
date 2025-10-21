const express = require("express");
const router = express.Router();
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const {
  getSummary,
  getEventStats,
} = require("../controllers/dashboardController");

// Semua rute di bawah ini memerlukan token
router.use(verifyToken);

router.get("/summary", authorizeRoles("superadmin", "admin"), getSummary);
router.get(
  "/event-stats",
  authorizeRoles("superadmin", "admin"),
  getEventStats
);

module.exports = router;
