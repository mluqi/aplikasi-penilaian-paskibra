const express = require("express");
const router = express.Router();
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const uploadEventFiles = require("../middlewares/eventPosterMiddleware");
const {
  createEvent,
  getAllEvents,
  getJuriEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getTeamsInEvent,
  addJuriToEvent,
  removeJuriFromEvent,
  addTeamToEvent,
  removeTeamFromEvent,
  getPublicEvents,
  getPublicEventById,
  generatePublicQris,
  createXenPlatformAccountForTeam,
  syncTeamBalance,
} = require("../controllers/eventController");

// Rute PUBLIK (tanpa token)
router.get("/public", getPublicEvents);
router.get("/public/:id", getPublicEventById);
router.post("/public/qris", generatePublicQris);

// Semua rute di bawah ini memerlukan token
router.use(verifyToken);

// Rute CRUD dasar untuk Event
router
  .route("/")
  .get(
    authorizeRoles("superadmin", "admin", "koordinator", "juri"),
    getAllEvents,
  )
  .post(
    authorizeRoles("admin", "koordinator_event", "superadmin"),
    uploadEventFiles.fields([
      { name: "event_poster", maxCount: 1 },
      { name: "event_juknis", maxCount: 1 },
    ]),
    createEvent,
  );

router.get(
  "/juri",
  authorizeRoles("juri", "admin", "superadmin"),
  getJuriEvents,
);2

// Rute untuk mengelola Juri dalam Event
router.post(
  "/juri",
  authorizeRoles("superadmin", "admin", "koordinator_event"),
  addJuriToEvent,
);
router.delete(
  "/juri",
  authorizeRoles("superadmin", "admin", "koordinator_event"),
  removeJuriFromEvent,
);

// Rute untuk mengelola Tim dalam Event
router.get("/team/:event_id", authorizeRoles("juri"), getTeamsInEvent);
router.post(
  "/team",
  authorizeRoles("superadmin", "admin", "koordinator_event"),
  addTeamToEvent,
);
router.post(
  "/team/xenplatform",
  authorizeRoles("superadmin", "admin", "koordinator"),
  createXenPlatformAccountForTeam,
);
router.post(
  "/team/sync-balance",
  authorizeRoles("superadmin", "admin", "koordinator"),
  syncTeamBalance,
);
router.delete(
  "/team",
  authorizeRoles("superadmin", "admin", "koordinator_event"),
  removeTeamFromEvent,
);

router
  .route("/:id")
  .get(
    authorizeRoles("superadmin", "admin", "koordinator", "juri"),
    getEventById,
  )
  .put(
    authorizeRoles("superadmin", "admin", "koordinator_event"),
    uploadEventFiles.fields([
      { name: "event_poster", maxCount: 1 },
      { name: "event_juknis", maxCount: 1 },
    ]),
    updateEvent,
  )
  .delete(
    authorizeRoles("superadmin", "admin", "koordinator_event"),
    deleteEvent,
  );

module.exports = router;
