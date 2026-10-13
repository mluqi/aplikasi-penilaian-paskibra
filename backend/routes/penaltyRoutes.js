const express = require("express");
const router = express.Router();
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const {
  createTeamPenalty,
  getTeamPenalties,
  deleteTeamPenalty,
  getEventPenalties,
  addEventPenalty,
  removeEventPenalty,
} = require("../controllers/penaltyController");

// Menambahkan proteksi autentikasi (Admin, Juri/Panitia Lapangan)
router.use(
  verifyToken,
  authorizeRoles("superadmin", "admin", "koordinator_event", "asisten_juri"),
);

// Routes untuk Event Penalties (Penalti yang aktif di event)
router.get("/event/:event_id", getEventPenalties);
router.post("/event", addEventPenalty);
router.delete("/event/:id", removeEventPenalty);

// Routes untuk Penalti per Tim
router.post("/", createTeamPenalty);
router.get("/:event_id/:team_id", getTeamPenalties);
router.delete("/:id", deleteTeamPenalty);

module.exports = router;
