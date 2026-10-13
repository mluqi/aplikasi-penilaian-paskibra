const express = require("express");
const router = express.Router();
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const {
  addApiKey,
  getAllApiKeys,
  updateApiKey,
  deleteApiKey,
} = require("../controllers/apiKeyController");

router.use(verifyToken, authorizeRoles("superadmin"));

router.get("/", getAllApiKeys);
router.post("/", addApiKey);
router.put("/:id", updateApiKey);
router.delete("/:id", deleteApiKey);

module.exports = router;
