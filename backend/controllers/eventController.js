const {
  Events,
  Users,
  Teams,
  Event_juri,
  Event_teams,
  Donations,
  Aspeks,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");
const fs = require("fs");
const { logAktivitas } = require("../services/logService");
const path = require("path");
const {
  createXenPlatformAccount,
  createQrCode,
  getBalance,
} = require("../services/xenPlatformService");

// Helper untuk menghapus file lama
const deleteOldFile = (filePath) => {
  if (filePath) {
    const relativePath = filePath.startsWith("/")
      ? filePath.substring(1)
      : filePath;
    const absolutePath = path.join(__dirname, "..", relativePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlink(absolutePath, (err) => {
        if (err) console.error("Gagal menghapus file lama:", err);
      });
    }
  }
};

// Membuat event baru
exports.createEvent = async (req, res) => {
  const { id: userId, role: userRole } = req.user;
  const {
    event_name,
    event_tanggal,
    event_tempat,
    event_waktu,
    event_biaya_pendaftaran,
    event_deskripsi,
    event_status = "draft",
    event_kategori,
    event_tingkat,
    event_provinsi,
    event_kota,
    event_penyelenggara,
    event_contact_person_name,
    event_contact_person_number,
    event_batas_pendaftaran,
    koordinator_id,
    event_kuota,
  } = req.body;

  try {
    // Tentukan koordinator_id. Admin bisa memilih, koordinator event otomatis terisi.
    const finalKoordinatorId =
      userRole === "admin" || userRole === "superadmin"
        ? koordinator_id
        : userId;

    // Generate ID unik untuk event
    const lastEvent = await Events.findOne({ order: [["createdAt", "DESC"]] });
    let event_id = "EVT0001";
    if (lastEvent) {
      const lastIdNum = parseInt(lastEvent.event_id.replace("EVT", ""), 10);
      event_id = "EVT" + (lastIdNum + 1).toString().padStart(4, "0");
    }

    let event_poster = null;
    let event_juknis = null;
    if (req.files) {
      if (req.files.event_poster) {
        event_poster = `/uploads/events/${req.files.event_poster[0].filename}`;
      }
      if (req.files.event_juknis) {
        event_juknis = `/uploads/events/${req.files.event_juknis[0].filename}`;
      }
    }

    let executedQuery;
    const createData = {
      event_id,
      event_name,
      event_tanggal,
      event_tempat,
      event_waktu,
      event_poster,
      event_juknis,
      event_biaya_pendaftaran,
      event_deskripsi,
      event_status,
      event_kategori,
      event_tingkat,
      event_provinsi,
      event_kota,
      event_batas_pendaftaran,
      event_contact_person_name,
      event_contact_person_number,
      event_penyelenggara,
      koordinator_id: finalKoordinatorId,
      event_kuota: event_kuota ? parseInt(event_kuota) : null,
    };
    const newEvent = await Events.create(
      createData,
      // Tangkap query yang dieksekusi
      { logging: (sql) => (executedQuery = sql) },
    );

    // Log aktivitas
    logAktivitas({
      target: newEvent.event_id,
      action: "CREATE",
      detail: "SUCCESS",
      query: executedQuery,
      data: createData,
      owner: req.user.id,
    });

    res
      .status(201)
      .json({ message: "Event berhasil dibuat.", event: newEvent });
  } catch (error) {
    console.error(error);
    logAktivitas({
      target: req.body.event_name,
      action: "CREATE_FAILED",
      detail: `Error: ${error.message}`,
      query: null,
      owner: req.user.id,
    });
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

// Mendapatkan semua event
exports.getAllEvents = async (req, res) => {
  try {
    const { id: userId, role: userRole } = req.user;
    const findOptions = {
      include: [
        { model: Users, as: "User", attributes: ["user_name"] },
        { model: Event_juri, attributes: ["juri_id"] },
        { model: Event_teams, attributes: ["team_id"] },
      ],
      order: [["event_tanggal", "DESC"]],
    };

    if (userRole === "koordinator_event") {
      findOptions.where = { koordinator_id: userId };
    }

    const events = await Events.findAll(findOptions);
    res.status(200).json({ events });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

// Mendapatkan semua event untuk juri yang sedang login
exports.getJuriEvents = async (req, res) => {
  try {
    const { id: juriId } = req.user;

    const events = await Events.findAll({
      include: [
        {
          model: Event_juri,
          where: { juri_id: juriId },
          attributes: [], // Tidak perlu menampilkan detail dari tabel pivot
        },
        {
          model: Users,
          as: "User",
          attributes: ["user_name"],
        },
        { model: Event_teams, include: [{ model: Teams }] },
      ],
      order: [["event_tanggal", "DESC"]],
    });

    res.status(200).json({ events });
  } catch (error) {
    console.error("Gagal mengambil data event untuk juri:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

// Mendapatkan detail satu event
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Events.findByPk(id, {
      include: [
        { model: Users, as: "User", attributes: ["user_name", "user_email"] },
        {
          model: Event_juri,
          include: [{ model: Users, attributes: ["user_id", "user_name"] }],
        },
        {
          model: Event_teams,
          include: [{ model: Teams, attributes: ["team_id", "team_name", "team_logo"] }],
        },
      ],
    });

    if (!event) {
      return res.status(404).json({ message: "Event tidak ditemukan." });
    }
    res.status(200).json({ event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

// Memperbarui event
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Events.findByPk(id);
    if (!event) {
      return res.status(404).json({ message: "Event tidak ditemukan." });
    }

    let event_poster = event.event_poster;
    let event_juknis = event.event_juknis;

    if (req.files) {
      if (req.files.event_poster) {
        deleteOldFile(event.event_poster);
        event_poster = `/uploads/events/${req.files.event_poster[0].filename}`;
      }
      if (req.files.event_juknis) {
        deleteOldFile(event.event_juknis);
        event_juknis = `/uploads/events/${req.files.event_juknis[0].filename}`;
      }
    }

    let executedQuery;
    const updateData = { ...req.body, event_poster, event_juknis };
    const updatedEvent = await event.update(updateData, {
      logging: (sql) => (executedQuery = sql),
    });

    // Log aktivitas
    logAktivitas({
      target: updatedEvent.event_id,
      action: "UPDATE",
      detail: "SUCCESS",
      query: executedQuery,
      data: updateData,
      owner: req.user.id,
    });
    res
      .status(200)
      .json({ message: "Event berhasil diperbarui.", event: updatedEvent });
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

// Menghapus event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Events.findByPk(id);
    if (!event) {
      return res.status(404).json({ message: "Event tidak ditemukan." });
    }

    let executedQuery;
    deleteOldFile(event.event_poster);
    deleteOldFile(event.event_juknis);
    // onDelete: 'CASCADE' akan menghapus relasi di Event_juri dan Event_teams
    await event.destroy({ logging: (sql) => (executedQuery = sql) });

    // Log aktivitas
    logAktivitas({
      target: id,
      action: "DELETE",
      detail: `SUCCESS - Nama: ${event.event_name}`,
      query: executedQuery,
      data: { id },
      owner: req.user.id,
    });

    res.status(200).json({ message: "Event berhasil dihapus." });
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

// Menambahkan Juri ke Event
exports.addJuriToEvent = async (req, res) => {
  try {
    const { event_id, juri_id, peran_juri } = req.body;
    const event = await Events.findByPk(event_id);
    const juri = await Users.findOne({
      where: { user_id: juri_id, user_role: "juri" },
    });

    if (!event || !juri) {
      return res
        .status(404)
        .json({ message: "Event atau Juri tidak ditemukan." });
    }

    let executedQuery;
    await Event_juri.create(
      { event_id, juri_id, peran_juri: peran_juri || "Juri Penilai" },
      { logging: (sql) => (executedQuery = sql) },
    );
    logAktivitas({
      target: event_id,
      action: "ADD_JURI",
      detail: `SUCCESS - Juri ID: ${juri_id}`,
      query: executedQuery,
      data: { event_id, juri_id },
      owner: req.user.id,
    });
    res.status(201).json({ message: "Juri berhasil ditambahkan ke event." });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(409)
        .json({ message: "Juri ini sudah terdaftar di event tersebut." });
    }
    console.error(error);
    logAktivitas({
      target: req.body.event_id,
      action: "ADD_JURI_FAILED",
      detail: `Error: ${error.message} - Juri ID: ${req.body.juri_id}`,
      query: null,
      owner: req.user.id,
    });
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

// Menghapus Juri dari Event
exports.removeJuriFromEvent = async (req, res) => {
  try {
    const { event_id, juri_id } = req.body;
    let executedQuery;
    const result = await Event_juri.destroy({
      where: { event_id, juri_id },
      logging: (sql) => (executedQuery = sql),
    });

    if (result === 0) {
      return res
        .status(404)
        .json({ message: "Juri tidak ditemukan di event ini." });
    }

    logAktivitas({
      target: event_id,
      action: "REMOVE_JURI",
      detail: `SUCCESS - Juri ID: ${juri_id}`,
      query: executedQuery,
      data: { event_id, juri_id },
      owner: req.user.id,
    });
    res.status(200).json({ message: "Juri berhasil dihapus dari event." });
  } catch (error) {
    console.error(error);
    logAktivitas({
      target: req.body.event_id,
      action: "REMOVE_JURI_FAILED",
      detail: `Error: ${error.message} - Juri ID: ${req.body.juri_id}`,
      query: null,
      owner: req.user.id,
    });
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

exports.getTeamsInEvent = async (req, res) => {
  try {
    const { event_id } = req.params;
    const event = await Events.findByPk(event_id, {
      include: [
        {
          model: Event_teams,
          include: [{ model: Teams }],
        },
      ],
    });

    if (!event) {
      return res.status(404).json({ message: "Event tidak ditemukan." });
    }

    const teams = event.Event_teams.map((et) => et.Team);
    res.status(200).json({ teams });
  } catch (error) {
    console.error("Gagal mengambil data tim dalam event:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

// Menambahkan Tim ke Event
exports.addTeamToEvent = async (req, res) => {
  try {
    const { event_id, team_id } = req.body;
    const event = await Events.findByPk(event_id);
    const team = await Teams.findByPk(team_id);

    if (!event || !team) {
      return res
        .status(404)
        .json({ message: "Event atau Tim tidak ditemukan." });
    }

    // Validasi batas pendaftaran
    if (event.event_batas_pendaftaran) {
      const now = new Date();
      const batasPendaftaran = new Date(event.event_batas_pendaftaran);
      if (now > batasPendaftaran) {
        return res.status(400).json({
          message: "Batas waktu pendaftaran untuk event ini telah berakhir.",
        });
      }
    }

    // Validasi kuota pendaftaran tim
    if (event.event_kuota !== null && event.event_kuota > 0) {
      const currentTeamCount = await Event_teams.count({
        where: { event_id },
      });

      if (currentTeamCount >= event.event_kuota) {
        return res
          .status(400)
          .json({ message: "Kuota pendaftaran untuk event ini sudah penuh." });
      }
    }

    let executedQuery;
    await Event_teams.create(
      { event_id, team_id, balance: 0 },
      { logging: (sql) => (executedQuery = sql) },
    );
    logAktivitas({
      target: event_id,
      action: "ADD_TEAM",
      detail: `SUCCESS - Team ID: ${team_id}`,
      query: executedQuery,
      data: { event_id, team_id },
      owner: req.user.id,
    });
    res.status(201).json({ message: "Tim berhasil ditambahkan ke event." });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(409)
        .json({ message: "Tim ini sudah terdaftar di event tersebut." });
    }
    console.error(error);
    logAktivitas({
      target: req.body.event_id,
      action: "ADD_TEAM_FAILED",
      detail: `Error: ${error.message} - Team ID: ${req.body.team_id}`,
      query: null,
      owner: req.user.id,
    });
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

// Buat Akun XenPlatform untuk Tim
exports.createXenPlatformAccountForTeam = async (req, res) => {
  try {
    const { event_id, team_id } = req.body;

    const eventTeam = await Event_teams.findOne({
      where: { event_id, team_id },
    });

    if (!eventTeam) {
      return res
        .status(404)
        .json({ message: "Tim tidak terdaftar pada event ini." });
    }

    if (eventTeam.xenplatform_id) {
      return res
        .status(400)
        .json({ message: "Akun sudah pernah dibuat untuk tim ini." });
    }

    const event = await Events.findByPk(event_id);
    const team = await Teams.findByPk(team_id, {
      include: [{ model: Users, as: "User" }],
    });

    const email = team.User?.user_email || "default@palindo.id";
    // XenPlatform API mensyaratkan business_name hanya berisi karakter alfanumerik
    const businessName = `${team.team_name} ${event.event_name}`
      .replace(/[^a-zA-Z0-9 ]/g, "") // Hapus karakter selain huruf, angka, dan spasi
      .replace(/\s+/g, " ") // Rapikan spasi ganda menjadi spasi tunggal
      .trim()
      .substring(0, 255);

    // 1. Buat Sub-akun di XenPlatform
    const accountResponse = await createXenPlatformAccount(email, businessName);
    const xenplatform_id = accountResponse.id;
    const xenplatform_data = JSON.stringify(accountResponse); // Simpan seluruh respon

    let executedQuery;
    await eventTeam.update(
      { xenplatform_id, xenplatform_data },
      { logging: (sql) => (executedQuery = sql) },
    );

    logAktivitas({
      target: event_id,
      action: "CREATE_XEN_ACCOUNT",
      detail: `SUCCESS - Team ID: ${team_id}, XenPlatform ID: ${xenplatform_id}`,
      query: executedQuery,
      data: { event_id, team_id, xenplatform_id },
      owner: req.user.id,
    });

    res.status(200).json({
      message: "Akun XenPlatform berhasil dibuat.",
      data: eventTeam,
    });
  } catch (error) {
    console.error("XenPlatform Error:", error);
    res.status(500).json({
      message: "Gagal membuat akun XenPlatform untuk tim ini.",
      error: error.message,
    });
  }
};

// Menghapus Tim dari Event
exports.removeTeamFromEvent = async (req, res) => {
  try {
    const { event_id, team_id } = req.body;
    let executedQuery;
    const result = await Event_teams.destroy({
      where: { event_id, team_id },
      logging: (sql) => (executedQuery = sql),
    });

    if (result === 0) {
      return res
        .status(404)
        .json({ message: "Tim tidak ditemukan di event ini." });
    }

    logAktivitas({
      target: event_id,
      action: "REMOVE_TEAM",
      detail: `SUCCESS - Team ID: ${team_id}`,
      query: executedQuery,
      data: { event_id, team_id },
      owner: req.user.id,
    });
    res.status(200).json({ message: "Tim berhasil dihapus dari event." });
  } catch (error) {
    console.error(error);
    logAktivitas({
      target: req.body.event_id,
      action: "REMOVE_TEAM_FAILED",
      detail: `Error: ${error.message} - Team ID: ${req.body.team_id}`,
      query: null,
      owner: req.user.id,
    });
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

// Mendapatkan semua event yang sudah 'published' untuk publik
exports.getPublicEvents = async (req, res) => {
  try {
    const {
      kategori,
      tingkat,
      provinsi,
      kota,
      biaya,
      search,
      page = 1,
      limit = 9,
    } = req.query;

    const whereClause = {
      event_status: "published",
    };

    if (kategori) whereClause.event_kategori = kategori;
    if (tingkat) whereClause.event_tingkat = tingkat;
    if (biaya === "gratis") whereClause.event_biaya_pendaftaran = 0;
    if (biaya === "berbayar")
      whereClause.event_biaya_pendaftaran = { [Op.gt]: 0 };
    if (provinsi) whereClause.event_provinsi = { [Op.like]: `%${provinsi}%` };
    if (kota) whereClause.event_kota = { [Op.like]: `%${kota}%` };
    if (search) {
      whereClause[Op.or] = [{ event_name: { [Op.like]: `%${search}%` } }];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Events.findAndCountAll({
      where: whereClause,
      order: [["event_tanggal", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
    });

    res.status(200).json({
      events: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Gagal mengambil data event publik:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

// Mendapatkan detail satu event publik berdasarkan ID
exports.getPublicEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Events.findOne({
      where: {
        event_id: id,
        event_status: "published",
      },
      include: [
        {
          model: Event_teams,
          include: [
            {
              model: Teams,
              attributes: ["team_id", "team_name", "team_sekolah_instansi"],
            },
          ],
          attributes: ["team_id", "xenplatform_id"], // Diperlukan untuk filter tim yang bisa didonasi
        },
        {
          model: Event_juri,
          include: [{ model: Users, attributes: ["user_name", "user_photo"] }],
        },
        {
          model: Aspeks,
          attributes: ["nama_aspek", "bobot"],
        },
      ],
      order: [[Aspeks, "urutan", "ASC"]],
    });

    if (!event) {
      return res
        .status(404)
        .json({ message: "Event tidak ditemukan atau belum dipublikasikan." });
    }

    res.status(200).json({ event });
  } catch (error) {
    console.error("Gagal mengambil data detail event publik:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

// Generate QRIS Dinamis untuk Donasi Publik
exports.generatePublicQris = async (req, res) => {
  try {
    const { event_id, team_id, amount } = req.body;

    const eventTeam = await Event_teams.findOne({
      where: { event_id, team_id },
    });
    if (!eventTeam || !eventTeam.xenplatform_id) {
      return res
        .status(400)
        .json({ message: "Tim ini belum mengaktifkan fitur donasi." });
    }

    const referenceId = `DON-${event_id}-${team_id}-${Date.now()}`;

    // Generate QRIS bertipe DYNAMIC dengan amount tertentu
    const qrResponse = await createQrCode(
      referenceId,
      eventTeam.xenplatform_id,
      amount,
    );

    res.status(200).json({ qris: qrResponse });
  } catch (error) {
    console.error("Gagal generate public QRIS:", error);
    res.status(500).json({ message: "Gagal membuat QRIS Donasi." });
  }
};

// Sinkronisasi Saldo/Balance Manual dari XenPlatform
exports.syncTeamBalance = async (req, res) => {
  try {
    const { event_id, team_id } = req.body;

    const eventTeam = await Event_teams.findOne({
      where: { event_id, team_id },
    });

    if (!eventTeam) {
      return res
        .status(404)
        .json({ message: "Tim tidak terdaftar pada event ini." });
    }

    if (!eventTeam.xenplatform_id) {
      return res
        .status(400)
        .json({ message: "Akun XenPlatform belum dibuat untuk tim ini." });
    }

    // Panggil API XenPlatform untuk mendapatkan saldo cash
    const balanceData = await getBalance(eventTeam.xenplatform_id);
    const newBalance = balanceData.balance || 0; // Xendit /balance endpoint mengembalikan objek berisi `balance`

    await eventTeam.update({ balance: newBalance });

    logAktivitas({
      target: event_id,
      action: "SYNC_BALANCE",
      detail: `SUCCESS - Team ID: ${team_id}, New Balance: ${newBalance}`,
      owner: req.user.id,
    });

    res
      .status(200)
      .json({ message: "Saldo berhasil disinkronisasi.", balance: newBalance });
  } catch (error) {
    console.error("Gagal sinkronisasi saldo:", error);
    res.status(500).json({
      message: "Gagal menyinkronkan saldo tim.",
      error: error.message,
    });
  }
};
