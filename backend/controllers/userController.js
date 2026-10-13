const { Users } = require("../models");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const fs = require("fs");
const { logAktivitas } = require("../services/logService");
const path = require("path");
const { generateNextUserId, getRolePrefix } = require("../utils/idGenerator");

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
      "asisten_juri",
    ];
    if (!validRoles.includes(user_role)) {
      return res.status(400).json({ message: "Role tidak valid." });
    }

    const newUserId = await generateNextUserId(user_role);

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
      status: "active",
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

exports.importUsersExcel = async (req, res) => {
  const t = await require("../models").sequelize.transaction();
  try {
    const { excel_data } = req.body;
    if (!excel_data) {
      await t.rollback();
      return res.status(400).json({ message: "Data Excel tidak ditemukan." });
    }

    const xlsx = require("xlsx");
    const buffer = Buffer.from(excel_data, "base64");
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(worksheet);

    if (!rows || rows.length === 0) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "File Excel kosong atau format tidak valid." });
    }

    const roleIdCounters = {};
    const getNextIdForRole = async (role) => {
      const rolePrefix = getRolePrefix(role);
      if (roleIdCounters[rolePrefix] === undefined) {
        const usersWithPrefix = await Users.findAll({
          where: {
            user_id: { [Op.like]: `${rolePrefix}%` },
          },
          attributes: ["user_id"],
          transaction: t,
          raw: true,
        });

        let maxNum = 0;
        for (const u of usersWithPrefix) {
          if (u.user_id) {
            const match = u.user_id.match(/\d+/);
            if (match) {
              const num = parseInt(match[0], 10);
              if (!isNaN(num) && num > maxNum) {
                maxNum = num;
              }
            }
          }
        }
        roleIdCounters[rolePrefix] = maxNum;
      }

      roleIdCounters[rolePrefix]++;
      let candidateId = `${rolePrefix}${String(roleIdCounters[rolePrefix]).padStart(4, "0")}`;
      while (
        await Users.findOne({ where: { user_id: candidateId }, transaction: t })
      ) {
        roleIdCounters[rolePrefix]++;
        candidateId = `${rolePrefix}${String(roleIdCounters[rolePrefix]).padStart(4, "0")}`;
      }
      return candidateId;
    };

    const usersToInsert = [];
    const emailsInExcel = new Set();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const excelRowNumber = i + 2; // Baris 1 adalah header, jadi data dimulai dari baris 2

      // Mendukung nama kolom "user_name" atau "Nama"
      const user_name = row["user_name"] || row["Nama"] || row["Nama Lengkap"];
      const user_email =
        row["user_email"] || row["Email"] || row["Alamat Email"];
      const rawPassword = row["user_password"] || row["Password"];
      const user_role =
        row["user_role"] || row["Role"] || row["role"] || "koordinator_team";

      if (!user_name || !user_email || !rawPassword) {
        await t.rollback();
        return res.status(400).json({
          message: `Gagal mengimpor pada Baris ke-${excelRowNumber}: Terdapat data yang tidak lengkap (Nama, Email, atau Password kosong).`,
        });
      }

      if (emailsInExcel.has(user_email)) {
        await t.rollback();
        return res.status(400).json({
          message: `Gagal mengimpor pada Baris ke-${excelRowNumber}: Terdapat duplikasi email (${user_email}) di dalam file Excel.`,
        });
      }
      emailsInExcel.add(user_email);

      const existingUser = await Users.findOne({
        where: { user_email },
        transaction: t,
      });
      if (existingUser) {
        await t.rollback();
        return res.status(400).json({
          message: `Gagal mengimpor pada Baris ke-${excelRowNumber}: Email ${user_email} sudah terdaftar di sistem.`,
        });
      }

      const newUserId = await getNextIdForRole(user_role);
      const hashedPassword = await bcrypt.hash(String(rawPassword), 10);

      usersToInsert.push({
        user_id: newUserId,
        user_name: String(user_name),
        user_email: String(user_email),
        user_password: hashedPassword,
        user_role: String(user_role),
        status: "active",
        is_active: true,
      });
    }

    if (usersToInsert.length > 0) {
      await Users.bulkCreate(usersToInsert, { transaction: t });
    }

    await t.commit();

    logAktivitas({
      target: "Import Excel",
      action: "IMPORT_USERS",
      detail: `Berhasil import ${usersToInsert.length} user.`,
      owner: req.user.id,
    });

    res.status(200).json({
      message: `${usersToInsert.length} pengguna berhasil diimpor.`,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error importing users:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan saat import data pengguna." });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const { Op } = require("sequelize");

    const whereClause = { status: { [Op.ne]: "pending" } };

    if (search) {
      whereClause[Op.or] = [
        { user_name: { [Op.like]: `%${search}%` } },
        { user_email: { [Op.like]: `%${search}%` } },
      ];
    }

    const findOptions = {
      where: whereClause,
      attributes: { exclude: ["user_password", "user_token"] },
      order: [["createdAt", "ASC"]],
    };

    if (page && limit) {
      const parsedLimit = parseInt(limit, 10);
      const parsedPage = parseInt(page, 10);
      const offset = (parsedPage - 1) * parsedLimit;

      const totalItems = await Users.count({ where: findOptions.where });

      findOptions.limit = parsedLimit;
      findOptions.offset = offset;

      const users = await Users.findAll(findOptions);
      return res.status(200).json({
        users,
        totalItems,
        totalPages: Math.ceil(totalItems / parsedLimit),
        currentPage: parsedPage,
      });
    }

    const users = await Users.findAll(findOptions);
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

exports.getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await Users.findAll({
      where: { status: "pending" },
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
        "asisten_juri",
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
        user.user_password,
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

exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Users.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    if (user.user_id === req.user.id) {
      return res
        .status(400)
        .json({ message: "Anda tidak dapat menonaktifkan akun Anda sendiri." });
    }

    if (user.status === "pending") {
      return res.status(400).json({
        message:
          "User ini berstatus pending. Gunakan fitur 'Approve' untuk mengaktifkan.",
      });
    }

    user.status = user.status === "active" ? "inactive" : "active";

    let executedQuery;
    await user.save({ logging: (sql) => (executedQuery = sql) });

    // Log aktivitas
    logAktivitas({
      target: id,
      action: user.is_active ? "ACTIVATE" : "DEACTIVATE",
      detail: "SUCCESS",
      query: executedQuery,
      data: { is_active: user.is_active },
      owner: req.user.id,
    });

    res.status(200).json({
      message: `User berhasil ${user.is_active ? "diaktifkan" : "dinonaktifkan"}.`,
      user: {
        id: user.user_id,
        name: user.user_name,
        email: user.user_email,
        role: user.user_role,
        is_active: user.is_active,
      },
    });
  } catch (error) {
    console.error(error);
    logAktivitas({
      target: req.params.id,
      action: "CHANGE_STATUS_FAILED",
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

    if (user.status !== "pending") {
      return res
        .status(400)
        .json({ message: "User ini tidak berstatus pending." });
    }

    const newUserId = await generateNextUserId(user.user_role, t);

    // 1. Buat user baru dengan ID permanen dan data dari user sementara
    let executedQuery;
    const approveData = {
      user_id: newUserId,
      user_name: user.user_name,
      user_email: user.user_email,
      user_password: user.user_password,
      user_role: user.user_role,
      user_photo: user.user_photo,
      status: "active",
      is_active: true,
      createdAt: user.createdAt,
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
