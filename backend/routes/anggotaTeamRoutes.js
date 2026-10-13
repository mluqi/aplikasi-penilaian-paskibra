const express = require("express");
const router = express.Router();
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const upload = require("../middlewares/fileMiddleware");
const {
  createAnggota,
  getAllAnggotaByTeam,
  updateAnggota,
  deleteAnggota,
} = require("../controllers/anggotaTeamController");

// Semua rute di bawah ini memerlukan token dan peran 'admin' atau 'koordinator'
router.use(
  verifyToken,
  authorizeRoles("superadmin", "admin", "koordinator_team"),
);

// Route: /api/anggota/team/:team_id
router
  .route("/team/:team_id")
  .post(upload.single("anggota_foto"), createAnggota)
  .get(getAllAnggotaByTeam);

// Route: /api/anggota/:anggota_id
router
  .route("/:anggota_id")
  .put(upload.single("anggota_foto"), updateAnggota)
  .delete(deleteAnggota);

module.exports = router;
