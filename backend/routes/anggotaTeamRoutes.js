const express = require("express");
const router = express.Router();
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const {
  createAnggota,
  getAllAnggotaByTeam,
  updateAnggota,
  deleteAnggota,
} = require("../controllers/anggotaTeamController");

// Semua rute di bawah ini memerlukan token dan peran 'admin' atau 'koordinator'
router.use(verifyToken, authorizeRoles("superadmin", "admin", "koordinator_team"));

// Route: /api/anggota/team/:team_id
router.route("/team/:team_id").post(createAnggota).get(getAllAnggotaByTeam);

// Route: /api/anggota/:anggota_id
router.route("/:anggota_id").put(updateAnggota).delete(deleteAnggota);

module.exports = router;
