const jwt = require("jsonwebtoken");
const { Users } = require("../models");

/**
 * Middleware untuk memverifikasi token JWT.
 * Memastikan token ada, valid, dan cocok dengan yang ada di database.
 * Jika berhasil, menempelkan data user (id, role) ke `req.user`.
 */
exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "Akses ditolak. Token tidak ada." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Users.findOne({ where: { user_id: decoded.id } });

    // Memeriksa apakah user ada dan tokennya adalah token yang terakhir kali login
    if (!user || user.user_token !== token) {
      return res
        .status(401)
        .json({ message: "Token tidak valid atau sesi telah berakhir." });
    }

    // Menempelkan informasi penting ke object request untuk digunakan di middleware/controller selanjutnya
    req.user = {
      id: user.user_id,
      role: user.user_role,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token kedaluwarsa. Silakan login kembali." });
    }
    res.status(401).json({ message: "Token tidak valid." });
  }
};

/**
 * Middleware untuk otorisasi berdasarkan peran.
 * @param  {...string} allowedRoles - Daftar peran yang diizinkan mengakses rute.
 */
exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (
      !req.user ||
      !allowedRoles.some((role) => req.user.role.startsWith(role))
    ) {
      return res.status(403).json({
        message: "Akses ditolak. Anda tidak memiliki izin yang cukup.",
      });
    }
    next();
  };
};
