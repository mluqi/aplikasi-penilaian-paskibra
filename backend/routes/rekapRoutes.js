const express = require("express");
const router = express.Router();
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const {
  getRekapByEvent,
  getPublicRekapByEvent,
  getKategoriJuaraByEvent,
  createKategoriJuara,
  updateKategoriJuara,
  deleteKategoriJuara,
  getKlasemenKategori,
} = require("../controllers/rekapController");

router.get("/public/:event_id", getPublicRekapByEvent);
router.get("/public/kategori/:event_id", getKategoriJuaraByEvent);
router.get("/public/klasemen/:kategori_id", getKlasemenKategori);

router.use(verifyToken);

router.get(
  "/kategori/:event_id",
  authorizeRoles(
    "superadmin",
    "admin",
    "koordinator_event",
    "juri",
    "asisten_juri",
  ),
  getKategoriJuaraByEvent,
);
router.post(
  "/kategori",
  authorizeRoles("superadmin", "admin", "koordinator_event"),
  createKategoriJuara,
);
router.put(
  "/kategori/:id",
  authorizeRoles("superadmin", "admin", "koordinator_event"),
  updateKategoriJuara,
);
router.delete(
  "/kategori/:id",
  authorizeRoles("superadmin", "admin", "koordinator_event"),
  deleteKategoriJuara,
);
router.get(
  "/klasemen/:kategori_id",
  authorizeRoles(
    "superadmin",
    "admin",
    "koordinator_event",
    "juri",
    "asisten_juri",
  ),
  getKlasemenKategori,
);

router.get(
  "/:event_id",
  authorizeRoles(
    "superadmin",
    "admin",
    "koordinator_event",
    "juri",
    "koordinator_team",
    "asisten_juri",
  ),
  getRekapByEvent,
);

module.exports = router;
