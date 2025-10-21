const express = require("express");
const router = express.Router();
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const {
  createPenilaian,
  getAllPenilaian,
  getPenilaianById,
  getPenilaianDetailByTeam,
  getSubmittedTeams,
  lockPenilaian,
  unlockPenilaian,
  updatePenilaian,
} = require("../controllers/penilaianController");

router.patch(
  "/unlock/:penilaian_id",
  verifyToken,
  authorizeRoles("superadmin", "admin"),
  unlockPenilaian
);

router.patch(
  "/lock/:penilaian_id",
  verifyToken,
  authorizeRoles("superadmin", "admin", "juri"),
  lockPenilaian
);

router.use(
  verifyToken,
  authorizeRoles(
    "superadmin",
    "admin",
    "juri",
    "koordinator_team",
    "koordinator_event"
  )
);

router.get("/submitted-teams", getSubmittedTeams);

router.get("/detail/:event_id/:team_id", getPenilaianDetailByTeam);

router
  .route("/")
  .post(createPenilaian) 
  .get(getAllPenilaian); 

router.put("/:penilaian_id", updatePenilaian);

router.get("/:id", getPenilaianById);

module.exports = router;
