const express = require("express");
const router = express.Router();
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const {
  getRekapByEvent,
  getPublicRekapByEvent,
} = require("../controllers/rekapController");

router.get("/public/:event_id", getPublicRekapByEvent);

router.use(verifyToken);

router.get(
  "/:event_id",
  authorizeRoles(
    "superadmin",
    "admin",
    "koordinator_event",
    "juri",
    "koordinator_team"
  ),
  getRekapByEvent
);

module.exports = router;
