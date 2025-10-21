const express = require("express");
const router = express.Router();
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const uploadEventPoster = require("../middlewares/eventPosterMiddleware");
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
} = require("../controllers/eventController");

// Rute PUBLIK (tanpa token)
router.get("/public", getPublicEvents);
router.get("/public/:id", getPublicEventById);

// Semua rute di bawah ini memerlukan token
router.use(verifyToken);

// Rute CRUD dasar untuk Event
router
  .route("/")
  .get(
    authorizeRoles("superadmin", "admin", "koordinator", "juri"),
    getAllEvents
  )
  .post(
    authorizeRoles("admin", "koordinator_event"),
    uploadEventPoster.single("event_poster"),
    createEvent
  );

router.get(
  "/juri",
  authorizeRoles("juri", "admin", "superadmin"),
  getJuriEvents
);

// Rute untuk mengelola Juri dalam Event
router.post(
  "/juri",
  authorizeRoles("superadmin", "admin", "koordinator_event"),
  addJuriToEvent
);
router.delete(
  "/juri",
  authorizeRoles("superadmin", "admin", "koordinator_event"),
  removeJuriFromEvent
);

// Rute untuk mengelola Tim dalam Event
router.get("/team/:event_id", authorizeRoles("juri"), getTeamsInEvent);
router.post(
  "/team",
  authorizeRoles("superadmin", "admin", "koordinator_event"),
  addTeamToEvent
);
router.delete(
  "/team",
  authorizeRoles("superadmin", "admin", "koordinator_event"),
  removeTeamFromEvent
);

router
  .route("/:id")
  .get(
    authorizeRoles("superadmin", "admin", "koordinator", "juri"),
    getEventById
  )
  .put(
    authorizeRoles("superadmin", "admin", "koordinator_event"),
    uploadEventPoster.single("event_poster"),
    updateEvent
  )
  .delete(
    authorizeRoles("superadmin", "admin", "koordinator_event"),
    deleteEvent
  );

module.exports = router;
