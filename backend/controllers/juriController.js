const { Users, Event_juri } = require("../models");
const bcrypt = require("bcrypt");
const fs = require("fs");
const { logAktivitas } = require("../services/logService");
const path = require("path");
const { generateNextUserId } = require("../utils/idGenerator");

// Helper untuk menghapus foto lama agar tidak menumpuk di server
const deleteOldPhoto = (photoPath) => {
  if (photoPath) {
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

exports.createJuri = async (req, res) => {
  try {
    const { user_name, user_email, user_password, event_id } = req.body;

    // Cek apakah email sudah terdaftar
    const existingUser = await Users.findOne({ where: { user_email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar." });
    }

    const user_role = "juri";

    const newUserId = await generateNextUserId("JRI");

    // Hash password sebelum menyimpan
    const hashedPassword = await bcrypt.hash(user_password, 10);

    // Dapatkan path foto jika diunggah
    let user_photo = null;
    if (req.file) {
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
      is_active: true, // Juri langsung aktif
    };
    const newUser = await Users.create(createData, {
      logging: (sql) => (executedQuery = sql),
    });

    // Jika event_id disediakan, assign juri ke event
    if (event_id) {
      const { Events } = require("../models");
      const event = await Events.findOne({ where: { event_id } });
      if (event) {
        await Event_juri.create({
          event_id,
          juri_id: newUserId,
        });
      }
    }

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
      message: "Juri berhasil dibuat.",
      user: {
        user_id: newUser.user_id,
        user_name: newUser.user_name,
        user_email: newUser.user_email,
        user_role: newUser.user_role,
      },
    });
  } catch (error) {
    console.error("Gagal membuat juri:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};