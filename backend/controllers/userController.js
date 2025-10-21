const { Users } = require("../models");
const bcrypt = require("bcrypt");
const fs = require("fs");
const { logAktivitas } = require("../services/logService");
const path = require("path");

// Helper untuk menghapus foto lama agar tidak menumpuk di server
const deleteOldPhoto = (photoPath) => {
  if (photoPath) {
    // photoPath dari DB adalah URL path seperti '/uploads/users/filename.jpg'.
    // Kita perlu mengubahnya menjadi path file sistem yang absolut.
    // path.join(__dirname, '..') mengarah ke direktori root backend.
    // Hapus '/' di awal photoPath agar path.join bekerja dengan benar.
    const relativePath = photoPath.startsWith("/")
      ? photoPath.substring(1)
      : photoPath;
    const absolutePath = path.join(__dirname, "..", relativePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlink(absolutePath, (err) => {
        if (err) console.error("Gagal menghapus foto lama:", err);
      });
    }
  }
};

exports.createUser = async (req, res) => {
  try {
    const { user_name, user_email, user_password, user_role } = req.body;

    // Cek apakah email sudah terdaftar
    const existingUser = await Users.findOne({ where: { user_email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar." });
    }

    const validRoles = [
      "superadmin",
      "admin",
      "juri",
      "koordinator_team",
      "koordinator_event",
    ];
    if (!validRoles.includes(user_role)) {
      return res.status(400).json({ message: "Role tidak valid." });
    }

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
    let prefix = "JRI";
    if (user_role === "admin") prefix = "ADM";
    if (user_role === "koordinator_team") prefix = "KOT";
    if (user_role === "koordinator_event") prefix = "KOE";

    const newUserId = `${prefix}${String(newIdNumber).padStart(4, "0")}`;

    // Hash password sebelum menyimpan
    const hashedPassword = await bcrypt.hash(user_password, 10);

    // Dapatkan path foto jika diunggah
    let user_photo = null;
    if (req.file) {
      // Simpan path yang dapat diakses dari web, misal: /images/users/namafile.jpg
      user_photo = `/uploads/users/${req.file.filename}`;
    }

    let executedQuery;
    const createData = {
      user_id: newUserId,
      user_name,
      user_email,
      user_password: hashedPassword,
      user_role,
      user_photo,
      is_active: true, // User yang dibuat admin langsung aktif
    };
    const newUser = await Users.create(createData, {
      logging: (sql) => (executedQuery = sql),
    });

    // Log aktivitas
    logAktivitas({
      target: newUser.user_id,
      action: "CREATE",
      detail: "SUCCESS",
      query: executedQuery,
      data: createData,
      owner: req.user.id,
    });

    res.status(201).json({
      message: "User berhasil dibuat.",
      user: {
        id: newUser.user_id,
        name: newUser.user_name,
        email: newUser.user_email,
        role: newUser.user_role,
        photo: newUser.user_photo,
      },
    });
  } catch (error) {
    console.error(error);
    logAktivitas({
      target: req.body.user_email,
      action: "CREATE_FAILED",
      detail: `Error: ${error.message}`,
      query: null,
      owner: req.user.id,
    });
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await Users.findAll({
      attributes: { exclude: ["user_password", "user_token"] },
      where: { is_active: true },
      order: [["createdAt", "ASC"]],
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

exports.getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await Users.findAll({
      where: { is_active: false },
      attributes: { exclude: ["user_password", "user_token"] },
      order: [["createdAt", "ASC"]],
    });
    res.status(200).json(pendingUsers);
  } catch (error) {
    console.error("Error fetching pending users:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Users.findByPk(id, {
      attributes: { exclude: ["user_password", "user_token"] },
    });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_name, user_email, user_password, user_role } = req.body;

    const user = await Users.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    if (user_email && user_email !== user.user_email) {
      const existingUser = await Users.findOne({ where: { user_email } });
      if (existingUser) {
        return res.status(400).json({ message: "Email sudah terdaftar." });
      }
    }

    if (user_role) {
      const validRoles = [
        "superadmin",
        "admin",
        "juri",
        "koordinator_team",
        "koordinator_event",
      ];
      if (!validRoles.includes(user_role)) {
        return res.status(400).json({ message: "Role tidak valid." });
      }
    }

    let updatedPassword = user.user_password;
    if (user_password) {
      updatedPassword = await bcrypt.hash(user_password, 10);
    }

    let user_photo = user.user_photo;
    if (req.file) {
      // Hapus foto lama jika ada
      deleteOldPhoto(user.user_photo);
      // Path untuk foto baru
      user_photo = `/uploads/users/${req.file.filename}`;
    }

    let executedQuery;
    const updateData = {
      user_name: user_name || user.user_name,
      user_email: user_email || user.user_email,
      user_password: updatedPassword,
      user_role: user_role || user.user_role,
      user_photo: user_photo,
    };
    await user.update(updateData, { logging: (sql) => (executedQuery = sql) });

    // Log aktivitas
    logAktivitas({
      target: id,
      action: "UPDATE",
      detail: "SUCCESS",
      query: executedQuery,
      data: updateData,
      owner: req.user.id,
    });

    res.status(200).json({
      message: "User berhasil diperbarui.",
      user: {
        id: user.user_id,
        name: user.user_name,
        email: user.user_email,
        role: user.user_role,
        photo: user.user_photo,
      },
    });
  } catch (error) {
    console.error(error);
    logAktivitas({
      target: req.params.id,
      action: "UPDATE_FAILED",
      detail: `Error: ${error.message}`,
      query: null,
      owner: req.user.id,
    });
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Users.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    // Hapus foto profil dari storage sebelum menghapus user
    deleteOldPhoto(user.user_photo);

    let executedQuery;
    const userEmail = user.user_email;
    await user.destroy({ logging: (sql) => (executedQuery = sql) });

    // Log aktivitas
    logAktivitas({
      target: id,
      action: "DELETE",
      detail: `SUCCESS - Email: ${userEmail}`,
      query: executedQuery,
      data: { id },
      owner: req.user.id,
    });
    res.status(200).json({ message: "User berhasil dihapus." });
  } catch (error) {
    console.error(error);
    logAktivitas({
      target: req.params.id,
      action: "DELETE_FAILED",
      detail: `Error: ${error.message}`,
      query: null,
      owner: req.user.id,
    });
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

exports.updateCurrentUser = async (req, res) => {
  try {
    const id = req.user.id; // Ambil ID pengguna dari token yang sudah diverifikasi
    const { user_name, current_password, new_password } = req.body;

    if (!user_name && !new_password && !req.file) {
      return res
        .status(400)
        .json({ message: "Tidak ada data untuk diupdate." });
    }

    const user = await Users.findOne({ where: { user_id: id } });
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    // Logika untuk update password
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({
          message: "Password saat ini diperlukan untuk mengubah password.",
        });
      }

      const isMatch = await bcrypt.compare(
        current_password,
        user.user_password
      );
      if (!isMatch) {
        return res.status(400).json({ message: "Password saat ini salah." });
      }

      user.user_password = await bcrypt.hash(new_password, 10);
    }

    // Logika untuk update nama
    if (user_name) {
      user.user_name = user_name;
    }

    // Logika untuk update foto
    if (req.file) {
      deleteOldPhoto(user.user_photo);
      user.user_photo = `/uploads/users/${req.file.filename}`;
    }

    let executedQuery;
    await user.save({ logging: (sql) => (executedQuery = sql) });

    // Log aktivitas
    logAktivitas({
      target: id,
      action: "UPDATE_PROFILE",
      detail: "SUCCESS",
      query: executedQuery,
      data: {
        user_name,
        new_password: new_password ? "***" : null,
        photo: req.file?.filename,
      },
      owner: req.user.id,
    });

    res.status(200).json({
      message: "Profil berhasil diperbarui.",
      user: {
        name: user.user_name,
        email: user.user_email,
        photo: user.user_photo,
      },
    });
  } catch (error) {
    console.error(error);
    logAktivitas({
      target: req.user.id,
      action: "UPDATE_PROFILE_FAILED",
      detail: `Error: ${error.message}`,
      query: null,
      owner: req.user.id,
    });
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

exports.approveUser = async (req, res) => {
  const t = await require("../models").sequelize.transaction();
  try {
    const { id } = req.params;
    const user = await Users.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    if (user.is_active) {
      return res.status(400).json({ message: "User sudah aktif." });
    }

    const lastUser = await Users.findOne({
      where: {
        user_role: user.user_role,
        is_active: true,
        user_id: { [require("sequelize").Op.notLike]: "TMP%" }, // Abaikan ID sementara
      },
      order: [["user_id", "DESC"]],
      transaction: t,
    });

    let newIdNumber = 1;
    if (lastUser && lastUser.user_id.match(/\d+/)) {
      // Mengambil angka dari belakang ID, lebih aman jika prefix bervariasi
      const lastIdNumber = parseInt(lastUser.user_id.match(/\d+$/)[0], 10);
      newIdNumber = lastIdNumber + 1;
    }

    let prefix = "JRI";
    if (user.user_role === "koordinator_team") prefix = "KOT";
    if (user.user_role === "koordinator_event") prefix = "KOE";

    const newUserId = `${prefix}${String(newIdNumber).padStart(4, "0")}`;

    // 1. Buat user baru dengan ID permanen dan data dari user sementara
    let executedQuery;
    const approveData = {
      user_id: newUserId,
      user_name: user.user_name,
      user_email: user.user_email,
      user_password: user.user_password,
      user_role: user.user_role,
      user_photo: user.user_photo,
      is_active: true, // Langsung aktifkan
      createdAt: user.createdAt, // Pertahankan tanggal registrasi asli
      updatedAt: new Date(),
    };
    await Users.create(approveData, {
      transaction: t,
      logging: (sql) => (executedQuery = sql),
    });

    // 2. Hapus user sementara
    // Kita tidak bisa mendapatkan query dari destroy di dalam transaksi ini dengan mudah
    // Jadi kita log query dari create saja.
    await user.destroy({ transaction: t });

    // 3. Commit transaksi jika semua berhasil
    await t.commit();

    // Log aktivitas
    logAktivitas({
      target: newUserId,
      action: "APPROVE",
      detail: `SUCCESS - Old ID: ${id}`,
      query: executedQuery,
      data: approveData,
      owner: req.user.id,
    });

    res.status(200).json({ message: "User berhasil diaktifkan." });
  } catch (error) {
    await t.rollback(); // Batalkan semua perubahan jika terjadi error
    console.error("Error approving user:", error);
    logAktivitas({
      target: req.params.id,
      action: "APPROVE_FAILED",
      detail: `Error: ${error.message}`,
      query: null,
      owner: req.user.id,
    });
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};
