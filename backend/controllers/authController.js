const { Users, role_access } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { logAkses } = require("../services/logService");
const { getClientIp, getClientBrowser } = require("../utils/requestUtils");

exports.login = async (req, res) => {
  const { user_email, user_password } = req.body;
  const ip = getClientIp(req);
  const browser = getClientBrowser(req.headers["user-agent"] || "");
  try {
    const user = await Users.findOne({ where: { user_email } });
    if (!user) {
      // Catat upaya login yang gagal (user tidak ditemukan)
      logAkses({ id: user_email, ip, browser, status: "Gagal" });
      return res.status(400).json({ message: "Email atau password salah." });
    }

    // Cek apakah akun sudah aktif
    if (!user.is_active) {
      // Catat upaya login yang gagal (akun tidak aktif)
      logAkses({ id: user.user_id, ip, browser, status: "Gagal" });
      return res.status(403).json({
        message: "Akun Anda belum diaktifkan. Silakan hubungi admin.",
      });
    }
    const isMatch = await bcrypt.compare(user_password, user.user_password);
    if (!isMatch) {
      // Catat upaya login yang gagal (password salah)
      logAkses({ id: user.user_id, ip, browser, status: "Gagal" });
      return res.status(400).json({ message: "Email atau password salah." });
    }

    // Ambil daftar izin (akses) berdasarkan peran pengguna
    const userAccesses = await role_access.findAll({
      where: { role_id: user.user_role },
      attributes: ["menu_id"],
    });

    const akses = userAccesses.map((item) => item.menu_id);

    const token = jwt.sign(
      { id: user.user_id, role: user.user_role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    user.user_token = token;
    await user.save();

    // Catat login yang berhasil
    logAkses({ id: user.user_id, ip, browser, status: "Berhasil" });

    res.status(200).json({
      message: "Login berhasil.",
      token,
      user: {
        id: user.user_id,
        name: user.user_name,
        email: user.user_email,
        role: user.user_role,
        photo: user.user_photo,
        akses: akses, // Sertakan daftar izin di sini
      },
    });
  } catch (error) {
    console.error(error);
    // Catat upaya login yang gagal karena kesalahan server
    logAkses({
      id: user_email, // Gunakan email dari request karena mungkin user belum didapatkan
      ip,
      browser,
      status: "Gagal",
    });
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

exports.register = async (req, res) => {
  try {
    // Logging untuk debugging: Tampilkan apa yang diterima server
    console.log("Received registration data:", {
      body: req.body,
      file: req.file,
    });

    const { user_name, user_email, user_password, user_role } = req.body;

    // Validasi input dasar
    if (!user_name || !user_email || !user_password || !user_role) {
      return res.status(400).json({ message: "Semua kolom harus diisi." });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await Users.findOne({ where: { user_email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar." });
    }

    // Validasi role yang diperbolehkan untuk registrasi publik
    const validRoles = ["juri", "koordinator_team", "koordinator_event"];
    if (!validRoles.includes(user_role)) {
      return res.status(400).json({ message: "Role tidak valid." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(user_password, 10);

    // Dapatkan path foto jika diunggah
    let user_photo = null;
    if (req.file) {
      // Simpan path yang dapat diakses dari web, misal: /uploads/users/namafile.jpg
      user_photo = `/uploads/users/${req.file.filename}`;
    }

    // Generate user_id sementara untuk user yang belum aktif
    // ID ini akan diganti saat user di-approve oleh admin
    const lastUser = await Users.findOne({
      where: { user_role },
      order: [["createdAt", "DESC"]],
    });
    let newIdNumber = 1;
    if (lastUser) {
      const lastId = lastUser.user_id;
      const lastIdNumber = parseInt(lastId.slice(3), 10);
      newIdNumber = lastIdNumber + 1;
    }
    const user_id = `TMP${String(newIdNumber).padStart(4, "0")}`; // Menggunakan prefix 'TMP' untuk sementara

    // Buat user baru dengan status tidak aktif
    await Users.create({
      user_id,
      user_name,
      user_email,
      user_password: hashedPassword,
      user_role,
      user_photo, // Tambahkan path foto
      is_active: false, // Akun tidak aktif secara default
    });

    res.status(201).json({
      message:
        "Registrasi berhasil. Akun Anda akan segera ditinjau oleh admin.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

exports.logout = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await Users.findByPk(userId);
    if (user) {
      user.user_token = null;
      await user.save();
    }
    res.status(200).json({ message: "Logout berhasil." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};
