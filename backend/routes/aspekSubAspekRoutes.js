const express = require("express");
const router = express.Router();
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const {
  createAspek,
  getAllAspeks,
  getAspeksById,
  updateAspek,
  deleteAspek,
  createSubAspek,
  getAllSubAspeks,
  getSubAspeksByAspekId,
  updateSubAspek,
  deleteSubAspek,
  getAllAspekSubAspek,
  getAspekSubAspekByPenilaianId,
} = require("../controllers/aspekSubAspekController");

// Semua rute di bawah ini memerlukan token dan peran 'admin' atau 'koordinator'
router.use(verifyToken, authorizeRoles("superadmin", "admin", "koordinator", "juri"));

// Route: /api/aspek
router
  .route("/")
  .post(createAspek) // Buat aspek baru, butuh event_id di body
  .get(getAllAspeks); // Dapatkan semua aspek

// Route: /api/aspek/:aspek_id
router
  .route("/:aspek_id")
  .get(getAspeksById) // Dapatkan aspek berdasarkan ID
  .put(updateAspek) // Perbarui aspek berdasarkan ID
  .delete(deleteAspek); // Hapus aspek berdasarkan ID

// Route: /api/aspek/:aspek_id/subaspek
router
  .route("/:aspek_id/subaspek")
  .get(getSubAspeksByAspekId)
  .post(createSubAspek);

// Route: /api/subaspek
router.route("/subaspek").get(getAllSubAspeks); // Dapatkan semua subaspek

// Route: /api/subaspek/:subaspek_id
router
  .route("/subaspek/:subaspek_id")
  .get(getAllAspekSubAspek) // Dapatkan semua aspek beserta sub-aspek dan nilai-nilai terkait
  .put(updateSubAspek) // Perbarui subaspek berdasarkan ID
  .delete(deleteSubAspek); // Hapus subaspek berdasarkan ID

// Route: /api/aspek/penilaian/:penilaian_id
router.route("/penilaian/:penilaian_id").get(getAspekSubAspekByPenilaianId);

module.exports = router;
