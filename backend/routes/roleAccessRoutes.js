const express = require("express");
const router = express.Router();
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const {
  getAccessMatrix,
  updateAccessMatrix,
} = require("../controllers/roleAccessController");

router.use(verifyToken, authorizeRoles("admin", "superadmin"));

router.route("/").get(getAccessMatrix).post(updateAccessMatrix);

module.exports = router;
