const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const { login, register, logout } = require("../controllers/authController");
const upload = require("../middlewares/fileMiddleware");

// Route untuk login
router.post("/login", login);

// Route untuk register
router.post("/register", upload.single("user_photo"), register);

// Route untuk logout
router.post("/logout", verifyToken, logout);

module.exports = router;
