const {
  Events,
  Users,
  Teams,
  Event_juri,
  Event_teams,
  Event_asisten,
  Anggota_team,
  Donations,
  Aspeks,
  Penilaian,
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
const {
  createPayment,
  generateQris,
  checkDokuPaymentStatus,
} = require("../services/doku.service");

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
    donasi_mulai,
    donasi_selesai,
    is_result_show,
    kejuaraan_template,
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
      donasi_mulai,
      donasi_selesai,
      is_result_show: is_result_show === "true" || is_result_show === true,
      kejuaraan_template: kejuaraan_template
        ? typeof kejuaraan_template === "string"
          ? kejuaraan_template
          : JSON.stringify(kejuaraan_template)
        : null,
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
    const { page, limit, search } = req.query;

    const findOptions = {
      include: [
        { model: Users, as: "User", attributes: ["user_name"] },
        { model: Event_juri, attributes: ["juri_id"] },
        { model: Event_asisten, attributes: ["asisten_id"] },
        { model: Event_teams, attributes: ["team_id"] },
      ],
      order: [["event_tanggal", "DESC"]],
      where: {},
    };

    if (userRole === "koordinator_event") {
      findOptions.where.koordinator_id = userId;
    }

    if (search) {
      findOptions.where[Op.or] = [
        { event_name: { [Op.like]: `%${search}%` } },
        { event_tempat: { [Op.like]: `%${search}%` } },
      ];
    }

    if (page && limit) {
      const parsedLimit = parseInt(limit, 10);
      const parsedPage = parseInt(page, 10);
      const offset = (parsedPage - 1) * parsedLimit;

      findOptions.limit = parsedLimit;
      findOptions.offset = offset;
      findOptions.distinct = true;

      const { count, rows: events } = await Events.findAndCountAll(findOptions);
      return res.status(200).json({
        events,
        totalItems: count,
        totalPages: Math.ceil(count / parsedLimit),
        currentPage: parsedPage,
      });
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
          include: [
            { model: Users, as: "User", attributes: ["user_id", "user_name"] },
            {
              model: Aspeks,
              attributes: ["aspek_id", "nama_aspek"],
              through: { attributes: [] }, // Exclude pivot table attributes
            },
          ],
        },
        {
          model: Event_asisten,
          include: [
            { model: Users, as: "User", attributes: ["user_id", "user_name"] },
          ],
        },
        {
          model: Event_teams,
          include: [
            {
              model: Teams,
              attributes: [
                "team_id",
                "team_name",
                "team_sekolah_instansi",
                "team_logo",
                "foto_all_team",
              ],
              include: [{ model: Anggota_team }],
            },
          ],
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

    if (updateData.is_result_show !== undefined) {
      updateData.is_result_show =
        updateData.is_result_show === "true" ||
        updateData.is_result_show === true;
    }

    if (
      updateData.kejuaraan_template &&
      typeof updateData.kejuaraan_template !== "string"
    ) {
      updateData.kejuaraan_template = JSON.stringify(
        updateData.kejuaraan_template,
      );
    }

    if (
      updateData.kategori_options &&
      typeof updateData.kategori_options !== "string"
    ) {
      updateData.kategori_options = JSON.stringify(
        updateData.kategori_options,
      );
    }

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
  const t = await sequelize.transaction();
  try {
    const { event_id, juri_id, aspek_ids } = req.body; // Terima array aspek_ids
    const event = await Events.findByPk(event_id);
    const juri = await Users.findOne({
      where: { user_id: juri_id, user_role: "juri" },
    });

    if (!event || !juri) {
      await t.rollback();
      return res
        .status(404)
        .json({ message: "Event atau Juri tidak ditemukan." });
    }

    let executedQuery;
    const newJuriAssignment = await Event_juri.create(
      { event_id, juri_id },
      { transaction: t, logging: (sql) => (executedQuery = sql) },
    );

    if (aspek_ids && aspek_ids.length > 0) {
      await newJuriAssignment.setAspeks(aspek_ids, { transaction: t });
    }

    await t.commit();

    logAktivitas({
      target: event_id,
      action: "ADD_JURI",
      detail: `SUCCESS - Juri ID: ${juri_id}`,
      query: executedQuery,
      data: { event_id, juri_id, aspek_ids },
      owner: req.user.id,
    });
    res.status(201).json({ message: "Juri berhasil ditambahkan ke event." });
  } catch (error) {
    await t.rollback();
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

    // Validasi: Cek apakah juri sudah mulai memberikan penilaian di event ini
    const hasPenilaian = await Penilaian.findOne({
      where: { event_id, juri_id },
    });
    if (hasPenilaian) {
      return res.status(400).json({
        message:
          "Gagal menghapus! Juri ini sudah mulai melakukan penilaian pada event.",
      });
    }

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

// Menambahkan Asisten Juri ke Event
exports.addAsistenToEvent = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { event_id, asisten_id } = req.body;

    const event = await Events.findByPk(event_id, { transaction: t });
    const asisten = await Users.findOne({
      where: { user_id: asisten_id, user_role: "asisten_juri" },
      transaction: t,
    });

    if (!event || !asisten) {
      await t.rollback();
      return res
        .status(404)
        .json({ message: "Event atau Asisten Juri tidak ditemukan." });
    }

    // Validasi maksimal 2 asisten juri per event
    const currentAsistenCount = await Event_asisten.count({
      where: { event_id },
      transaction: t,
    });

    if (currentAsistenCount >= 2) {
      await t.rollback();
      return res
        .status(400)
        .json({
          message: "Satu event maksimal hanya boleh memiliki 2 Asisten Juri.",
        });
    }

    let executedQuery;
    await Event_asisten.create(
      { event_id, asisten_id },
      { transaction: t, logging: (sql) => (executedQuery = sql) },
    );

    await t.commit();

    logAktivitas({
      target: event_id,
      action: "ADD_ASISTEN",
      detail: `SUCCESS - Asisten ID: ${asisten_id}`,
      query: executedQuery,
      data: { event_id, asisten_id },
      owner: req.user.id,
    });
    res
      .status(201)
      .json({ message: "Asisten Juri berhasil ditambahkan ke event." });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res
      .status(500)
      .json({
        message: "Terjadi kesalahan server saat menambahkan Asisten Juri.",
      });
  }
};

// Menghapus Asisten Juri dari Event
exports.removeAsistenFromEvent = async (req, res) => {
  try {
    const { event_id, asisten_id } = req.body;

    let executedQuery;
    const result = await Event_asisten.destroy({
      where: { event_id, asisten_id },
      logging: (sql) => (executedQuery = sql),
    });

    if (result === 0) {
      return res
        .status(404)
        .json({ message: "Asisten Juri tidak ditemukan di event ini." });
    }

    logAktivitas({
      target: event_id,
      action: "REMOVE_ASISTEN",
      detail: `SUCCESS - Asisten ID: ${asisten_id}`,
      query: executedQuery,
      data: { event_id, asisten_id },
      owner: req.user.id,
    });
    res
      .status(200)
      .json({ message: "Asisten Juri berhasil dihapus dari event." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Terjadi kesalahan server saat menghapus Asisten Juri.",
      });
  }
};

// Memperbarui Aspek Juri di Event
exports.updateJuriAspeks = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { event_id, juri_id, aspek_ids } = req.body;

    const eventJuri = await Event_juri.findOne({
      where: { event_id, juri_id },
    });

    if (!eventJuri) {
      await t.rollback();
      return res
        .status(404)
        .json({ message: "Juri tidak ditemukan di event ini." });
    }

    let executedQuery;
    if (aspek_ids) {
      await eventJuri.setAspeks(aspek_ids, {
        transaction: t,
        logging: (sql) => (executedQuery = sql),
      });
    }

    await t.commit();

    logAktivitas({
      target: event_id,
      action: "UPDATE_JURI_ASPEK",
      detail: `SUCCESS - Juri ID: ${juri_id}`,
      query: executedQuery,
      data: { event_id, juri_id, aspek_ids },
      owner: req.user.id,
    });

    res.status(200).json({ message: "Aspek juri berhasil diperbarui." });
  } catch (error) {
    await t.rollback();
    console.error(error);
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

// Menambahkan Tim ke Event (Mendukung Single dan Multiple Teams)
exports.addTeamToEvent = async (req, res) => {
  try {
    const { event_id, team_id, team_ids } = req.body;
    const event = await Events.findByPk(event_id);

    if (!event) {
      return res.status(404).json({ message: "Event tidak ditemukan." });
    }

    const targetTeamIds = Array.isArray(team_ids)
      ? team_ids
      : team_id
        ? [team_id]
        : [];

    if (targetTeamIds.length === 0) {
      return res.status(400).json({ message: "Pilih setidaknya satu tim." });
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

    // Ambil tim yang sudah terdaftar
    const existingRegistrations = await Event_teams.findAll({
      where: {
        event_id,
        team_id: { [Op.in]: targetTeamIds },
      },
    });
    const existingTeamIdSet = new Set(
      existingRegistrations.map((r) => r.team_id),
    );
    const newTeamIdsToAdd = targetTeamIds.filter(
      (tId) => !existingTeamIdSet.has(tId),
    );

    if (newTeamIdsToAdd.length === 0) {
      return res.status(409).json({
        message: "Semua tim yang dipilih sudah terdaftar di event ini.",
      });
    }

    // Validasi kuota pendaftaran tim
    const currentTeamCount = await Event_teams.count({
      where: { event_id },
    });

    if (event.event_kuota !== null && event.event_kuota > 0) {
      if (currentTeamCount + newTeamIdsToAdd.length > event.event_kuota) {
        const sisa = Math.max(0, event.event_kuota - currentTeamCount);
        return res.status(400).json({
          message: `Kuota tidak mencukupi untuk menambahkan ${newTeamIdsToAdd.length} tim. Sisa kuota hanya ${sisa} tim.`,
        });
      }
    }

    const records = newTeamIdsToAdd.map((tId) => ({
      event_id,
      team_id: tId,
      balance: 0,
    }));

    await Event_teams.bulkCreate(records);

    logAktivitas({
      target: event_id,
      action: "ADD_TEAM",
      detail: `SUCCESS - Menambahkan ${newTeamIdsToAdd.length} tim: ${newTeamIdsToAdd.join(", ")}`,
      query: null,
      data: { event_id, team_ids: newTeamIdsToAdd },
      owner: req.user.id,
    });

    res.status(201).json({
      message: `${newTeamIdsToAdd.length} tim berhasil ditambahkan ke event.`,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "Sebagian atau seluruh tim sudah terdaftar di event ini.",
      });
    }
    console.error(error);
    logAktivitas({
      target: req.body.event_id,
      action: "ADD_TEAM_FAILED",
      detail: `Error: ${error.message}`,
      query: null,
      owner: req.user.id,
    });
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

// Buat / Aktifkan Akun E-Voting untuk Event
exports.createXenPlatformAccountForEvent = async (req, res) => {
  try {
    const { event_id } = req.body;

    const event = await Events.findByPk(event_id, {
      include: [{ model: Users, as: "User" }],
    });

    if (!event) {
      return res.status(404).json({ message: "Event tidak ditemukan." });
    }

    if (event.xenplatform_id) {
      return res.status(400).json({
        message: "E-Voting sudah aktif untuk event ini.",
      });
    }

    // Jika menggunakan DOKU (DOKU_CLIENT_ID tersedia)
    if (process.env.DOKU_CLIENT_ID) {
      const dokuAccountId = process.env.DOKU_ACCOUNT_ID || "DOKU_ACTIVE";
      const dokuData = JSON.stringify({
        provider: "DOKU",
        account_id: dokuAccountId,
        activated_at: new Date(),
      });

      let executedQuery;
      await event.update(
        { xenplatform_id: dokuAccountId, xenplatform_data: dokuData },
        { logging: (sql) => (executedQuery = sql) },
      );

      logAktivitas({
        target: event_id,
        action: "ACTIVATE_EVOTING",
        detail: `SUCCESS - Event ID: ${event_id}, E-Voting DOKU diaktifkan`,
        query: executedQuery,
        data: { event_id, xenplatform_id: dokuAccountId },
        owner: req.user.id,
      });

      return res.status(200).json({
        message: "Fitur E-Voting DOKU berhasil diaktifkan untuk Event ini.",
        data: event,
      });
    }

    const email = event.User?.user_email || "default@palindo.id";
    // XenPlatform API mensyaratkan business_name hanya berisi karakter alfanumerik
    const businessName = `${event.event_name}`
      .replace(/[^a-zA-Z0-9 ]/g, "") // Hapus karakter selain huruf, angka, dan spasi
      .replace(/\s+/g, " ") // Rapikan spasi ganda menjadi spasi tunggal
      .trim()
      .substring(0, 255);

    // 1. Buat Sub-akun di XenPlatform (Fallback Xendit)
    const accountResponse = await createXenPlatformAccount(email, businessName);
    const xenplatform_id = accountResponse.id;
    const xenplatform_data = JSON.stringify(accountResponse); // Simpan seluruh respon

    let executedQuery;
    await event.update(
      { xenplatform_id, xenplatform_data },
      { logging: (sql) => (executedQuery = sql) },
    );

    logAktivitas({
      target: event_id,
      action: "CREATE_XEN_ACCOUNT",
      detail: `SUCCESS - Event ID: ${event_id}, XenPlatform ID: ${xenplatform_id}`,
      query: executedQuery,
      data: { event_id, xenplatform_id },
      owner: req.user.id,
    });

    res.status(200).json({
      message: "Fitur E-Voting berhasil diaktifkan untuk Event.",
      data: event,
    });
  } catch (error) {
    console.error("E-Voting Activation Error:", error);
    res.status(500).json({
      message: "Gagal mengaktifkan E-Voting untuk event ini.",
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
              attributes: [
                "team_id",
                "team_name",
                "team_sekolah_instansi",
                "team_logo",
                "foto_all_team",
              ],
            },
          ],
          attributes: ["team_id", "xenplatform_id", "balance", "nomor_tampil"], // Diperlukan untuk filter tim yang bisa didonasi dan klasemen donasi
        },
        {
          model: Event_juri,
          include: [
            {
              model: Users,
              as: "User",
              attributes: ["user_name", "user_photo"],
            },
            {
              model: Aspeks,
              attributes: ["nama_aspek"],
              through: { attributes: [] },
            },
          ],
        },
        {
          model: Aspeks,
          attributes: ["nama_aspek"],
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

// Generate QRIS Dinamis untuk Donasi Publik via DOKU
exports.generatePublicQris = async (req, res) => {
  try {
    const { event_id, team_id, amount } = req.body;

    const event = await Events.findByPk(event_id);
    if (!event || !event.xenplatform_id) {
      return res
        .status(400)
        .json({ message: "Event ini belum mengaktifkan fitur E-Voting." });
    }

    const eventTeam = await Event_teams.findOne({
      where: { event_id, team_id },
      include: [{ model: Teams }],
    });
    if (!eventTeam) {
      return res
        .status(400)
        .json({ message: "Tim tidak terdaftar pada event ini." });
    }

    const referenceId = `DON-${event_id}-${team_id}-${Date.now()}`;

    let executedQuery;
    await Donations.create(
      {
        donation_id: referenceId,
        event_id,
        team_id,
        amount,
        payment_status: "PENDING",
        payment_method: "QRIS",
      },
      { logging: (sql) => (executedQuery = sql) },
    );

    logAktivitas({
      target: event_id,
      action: "CREATE_DONATION",
      detail: `SUCCESS - Team ID: ${team_id}, Amount: ${amount}`,
      query: executedQuery,
      data: { donation_id: referenceId, event_id, team_id, amount },
      owner: null,
    });

    // 1. DOKU Checkout V1 Create Payment
    const paymentParams = {
      order: {
        invoice_number: referenceId,
        amount: Number(amount),
        currency: "IDR",
        callback_url: process.env.DOKU_CALLBACK_URL || "https://palindo.id",
      },
      payment: {
        payment_due_date: 30, // 30 menit
      },
      customer: {
        name: "Pendukung " + (eventTeam.Team?.team_name || "Tim"),
        email: "customer@palindo.id",
        phone: "+6289618643138",
      },
      additional_info: {
        override_notification_url:
          process.env.DOKU_CALLBACK_URL ||
          "https://rekap-komando.palindo.id/api/webhook/doku",
        account: {
          id: event.xenplatform_id || process.env.DOKU_ACCOUNT_ID,
        },
      },
    };

    const paymentResponse = await createPayment(paymentParams);
    const tokenId =
      paymentResponse?.response?.payment?.token_id ||
      paymentResponse?.payment?.token_id ||
      paymentResponse?.token_id;

    if (!tokenId) {
      throw new Error("Gagal mendapatkan token_id dari DOKU payment response.");
    }

    // 2. Generate QRIS Code dari Token ID
    const qrisResponse = await generateQris(tokenId, referenceId);

    const qrString =
      qrisResponse.qr_code ||
      qrisResponse.qr_string ||
      qrisResponse.raw_qr ||
      (typeof qrisResponse === "string" ? qrisResponse : "");

    // Simpan tokenId ke database (kolom xendit_transaction_id) untuk keperluan fallback check-status
    await Donations.update(
      { xendit_transaction_id: tokenId },
      { where: { donation_id: referenceId } },
    );

    res.status(200).json({
      qris: {
        qr_string: qrString,
        qr_code: qrString,
        nmid: qrisResponse.nmid || null,
        token_id: tokenId,
      },
      referenceId,
    });
  } catch (error) {
    console.error("Gagal generate public QRIS DOKU:", error);
    res.status(500).json({
      message:
        error.response?.data?.error?.message ||
        error.message ||
        "Gagal membuat QRIS Donasi.",
    });
  }
};

// Mengecek status pembayaran donasi (dengan fallback DOKU check-status API)
exports.checkDonationStatus = async (req, res) => {
  try {
    const { donation_id } = req.params;
    const donation = await Donations.findOne({ where: { donation_id } });

    if (!donation) {
      return res.status(404).json({ message: "Donasi tidak ditemukan." });
    }

    // 1. Jika di DB sudah PAID (dari Callback/Webhook), langsung return PAID
    if (donation.payment_status === "PAID") {
      return res.status(200).json({ status: "PAID" });
    }

    // 2. Cek umur transaksi (dalam menit)
    const createdAtTime = new Date(donation.createdAt).getTime();
    const elapsedMinutes = (Date.now() - createdAtTime) / (1000 * 60);

    // Jika belum 5 menit, percayakan pada Webhook real-time dan langsung return status dari database
    if (elapsedMinutes < 5) {
      return res.status(200).json({ status: donation.payment_status || "PENDING" });
    }

    // 3. Fallback: Jika sudah 5 menit ke atas dan status masih belum PAID di DB, baru panggil API DOKU check-status
    const tokenId = donation.xendit_transaction_id;
    if (tokenId) {
      try {
        const dokuStatus = await checkDokuPaymentStatus(tokenId);
        // Response format DOKU: { status: "SUCCESS", payment_channel: "QRIS", amount: 20000.00, payment_date: "..." }
        if (
          dokuStatus?.status === "SUCCESS" ||
          dokuStatus?.status === "SUCCESSFUL"
        ) {
          const finalAmount = Number(dokuStatus.amount) || Number(donation.amount);

          await donation.update({
            amount: finalAmount,
            payment_status: "PAID",
            payment_method: dokuStatus.payment_channel || donation.payment_method || "QRIS",
            webhook_data: JSON.stringify(dokuStatus),
          });

          // Update real-time team balance
          const eventTeam = await Event_teams.findOne({
            where: { event_id: donation.event_id, team_id: donation.team_id },
          });

          if (eventTeam) {
            await eventTeam.update({
              balance: Number(eventTeam.balance || 0) + finalAmount,
            });
          }

          console.log(
            `✅ [DOKU Check-Status Fallback (>= 5 min)] Pembayaran Berhasil Terverifikasi: ${donation_id}`,
          );

          return res.status(200).json({ status: "PAID" });
        } else if (dokuStatus?.status === "FAILED" || dokuStatus?.status === "EXPIRED") {
          await donation.update({
            payment_status: dokuStatus.status,
            webhook_data: JSON.stringify(dokuStatus),
          });
          return res.status(200).json({ status: dokuStatus.status });
        }
      } catch (checkErr) {
        console.warn(
          `[DOKU Check-Status Fallback Error] ${donation_id}:`,
          checkErr.response?.data || checkErr.message,
        );
      }
    }

    res.status(200).json({ status: donation.payment_status || "PENDING" });
  } catch (error) {
    console.error("Gagal mengecek status donasi:", error);
    res.status(500).json({
      message: "Terjadi kesalahan server saat mengecek status donasi.",
    });
  }
};

// Sinkronisasi Saldo/Balance Manual dari database (Tabel Donations)
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

    // Hitung total donasi dari tabel Donations berstatus PAID
    const totalDonasi = await Donations.sum("amount", {
      where: { event_id, team_id, payment_status: "PAID" },
    });
    const newBalance = totalDonasi || 0;

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

// Memperbarui nomor tampil tim di event
exports.updateNomorTampilTeam = async (req, res) => {
  try {
    const { event_id, team_id, nomor_tampil } = req.body;

    const eventTeam = await Event_teams.findOne({
      where: { event_id, team_id },
    });

    if (!eventTeam) {
      return res
        .status(404)
        .json({ message: "Tim tidak terdaftar pada event ini." });
    }

    let executedQuery;
    await eventTeam.update(
      { nomor_tampil },
      { logging: (sql) => (executedQuery = sql) },
    );

    logAktivitas({
      target: event_id,
      action: "UPDATE_NOMOR_TAMPIL",
      detail: `SUCCESS - Team ID: ${team_id}, Nomor Tampil: ${nomor_tampil}`,
      query: executedQuery,
      data: { event_id, team_id, nomor_tampil },
      owner: req.user.id,
    });

    res.status(200).json({
      message: "Nomor tampil berhasil diperbarui.",
      data: eventTeam,
    });
  } catch (error) {
    console.error("Gagal memperbarui nomor tampil:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

// Memperbarui surat rekomendasi tim
exports.updateSuratRekomendasiTeam = async (req, res) => {
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

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "File surat rekomendasi tidak ditemukan." });
    }

    deleteOldFile(eventTeam.surat_rekomendasi);
    const surat_rekomendasi = `/uploads/events/${req.file.filename}`;

    let executedQuery;
    await eventTeam.update(
      { surat_rekomendasi },
      { logging: (sql) => (executedQuery = sql) },
    );

    logAktivitas({
      target: event_id,
      action: "UPDATE_SURAT_REKOMENDASI",
      detail: `SUCCESS - Team ID: ${team_id}`,
      query: executedQuery,
      data: { event_id, team_id, surat_rekomendasi },
      owner: req.user.id,
    });

    res.status(200).json({
      message: "Surat rekomendasi berhasil diunggah.",
      data: eventTeam,
    });
  } catch (error) {
    console.error("Gagal mengunggah surat rekomendasi:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

// Mendapatkan Rekapitulasi E-Voting
exports.getRekapEVoting = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Events.findByPk(id, {
      attributes: ["event_id", "event_name", "event_tanggal"],
      include: [
        {
          model: Event_teams,
          include: [
            {
              model: Teams,
              attributes: ["team_name", "team_sekolah_instansi", "team_logo"],
            },
          ],
          attributes: ["team_id", "balance", "nomor_tampil"],
        },
      ],
    });

    if (!event) {
      return res.status(404).json({ message: "Event tidak ditemukan." });
    }

    const rekap = event.Event_teams.map((et) => ({
      team_id: et.team_id,
      team_name: et.Team?.team_name,
      team_sekolah_instansi: et.Team?.team_sekolah_instansi,
      team_logo: et.Team?.team_logo,
      nomor_tampil: et.nomor_tampil,
      balance: et.balance,
    })).sort((a, b) => b.balance - a.balance);

    res
      .status(200)
      .json({
        event_name: event.event_name,
        event_tanggal: event.event_tanggal,
        rekap,
      });
  } catch (error) {
    console.error("Gagal mengambil rekap e-voting:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};
