const express = require("express");
const router = express.Router();
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const upload = require("../middlewares/fileMiddleware");
const {
  createUser,
  getAllUsers,
  getPendingUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateCurrentUser,
  approveUser,
} = require("../controllers/userController");

// Semua rute di bawah ini memerlukan token yang valid
router.use(verifyToken);

// Rute untuk pengguna mengelola profil mereka sendiri
router.put(
  "/profile",
  authorizeRoles("superadmin", "admin", "juri", "koordinator"),
  upload.single("user_photo"),
  updateCurrentUser
);

router.get("/pending", authorizeRoles("superadmin", "admin"), getPendingUsers);
router.patch(
  "/approve/:id",
  authorizeRoles("superadmin", "admin"),
  approveUser
);

// --- Rute di bawah ini hanya untuk Admin ---
router.get(
  "/",
  authorizeRoles("superadmin", "admin", "koordinator", "juri"),
  getAllUsers
);
router.post(
  "/",
  authorizeRoles("superadmin", "admin"),
  upload.single("user_photo"),
  createUser
);
router.get("/:id", authorizeRoles("superadmin", "admin"), getUserById);
router.put(
  "/:id",
  authorizeRoles("superadmin", "admin"),
  upload.single("user_photo"),
  updateUser
);
router.delete("/:id", authorizeRoles("superadmin", "admin"), deleteUser);

module.exports = router;
