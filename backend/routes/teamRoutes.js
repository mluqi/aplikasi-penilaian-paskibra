const express = require("express");
const router = express.Router();
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const uploadTeamLogo = require("../middlewares/teamLogoMiddleware");
const {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
} = require("../controllers/teamController");

// Semua rute di bawah ini memerlukan token yang valid
router.use(verifyToken);

// Rute untuk Admin dan Koordinator
router.get(
  "/",
  authorizeRoles("superadmin", "admin", "koordinator", "juri"),
  getAllTeams
);
router.post(
  "/",
  authorizeRoles("superadmin", "admin", "koordinator_team"),
  uploadTeamLogo.single("team_logo"),
  createTeam
);
router.get(
  "/:id",
  authorizeRoles("superadmin", "admin", "koordinator", "juri"),
  getTeamById
);
router.put(
  "/:id",
  authorizeRoles("superadmin", "admin", "koordinator_team"),
  uploadTeamLogo.single("team_logo"),
  updateTeam
);
router.delete(
  "/:id",
  authorizeRoles("superadmin", "admin", "koordinator_team"),
  deleteTeam
);

module.exports = router;
