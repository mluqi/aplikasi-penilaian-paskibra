const {
  Teams,
  Users,
  Anggota_team,
  Event_teams,
  Events,
  sequelize,
} = require("../models");
const fs = require("fs");
const path = require("path");
const { logAktivitas } = require("../services/logService");

// Helper untuk menghapus logo lama
const deleteOldLogo = (logoPath) => {
  if (logoPath) {
    const relativePath = logoPath.startsWith("/")
      ? logoPath.substring(1)
      : logoPath;
    const absolutePath = path.join(__dirname, "..", relativePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlink(absolutePath, (err) => {
        if (err) console.error("Gagal menghapus logo lama:", err);
      });
    }
  }
};

exports.createTeam = async (req, res) => {
  try {
    const {
      team_name,
      team_sekolah_instansi,
      koordinator_id,
      team_jumlah_anggota,
    } = req.body;

    // Check if koordinator_id exists in Users table and has role 'koordinator'
    const koordinator = await Users.findOne({
      where: { user_id: koordinator_id, user_role: "koordinator_team" },
    });
    if (!koordinator) {
      return res.status(400).json({
        message: "Koordinator tidak ditemukan atau bukan koordinator.",
      });
    }

    // Generate a unique team_id TM0001
    const lastTeam = await Teams.findOne({ order: [["team_id", "DESC"]] });
    let team_id = "TM0001";
    if (lastTeam) {
      const lastIdNum = parseInt(lastTeam.team_id.replace("TM", ""), 10);
      const newIdNum = lastIdNum + 1;
      team_id = "TM" + newIdNum.toString().padStart(4, "0");
    }

    let team_logo = null;
    let foto_all_team = null;

    // Deteksi jika menggunakan upload.fields() atau upload.single()
    if (req.files && !Array.isArray(req.files)) {
      if (req.files.team_logo)
        team_logo = `/uploads/teams/${req.files.team_logo[0].filename}`;
      if (req.files.foto_all_team)
        foto_all_team = `/uploads/teams/${req.files.foto_all_team[0].filename}`;
    } else if (req.file) {
      if (req.file.fieldname === "team_logo")
        team_logo = `/uploads/teams/${req.file.filename}`;
      if (req.file.fieldname === "foto_all_team")
        foto_all_team = `/uploads/teams/${req.file.filename}`;
    }

    let executedQuery;
    const createData = {
      team_id,
      team_name,
      team_sekolah_instansi,
      team_jumlah_anggota,
      team_logo,
      foto_all_team,
      koordinator_id,
    };
    const newTeam = await Teams.create(createData, {
      logging: (sql) => (executedQuery = sql),
    });

    // Log aktivitas
    logAktivitas({
      target: newTeam.team_id,
      action: "CREATE",
      detail: "SUCCESS",
      query: executedQuery,
      data: createData,
      owner: req.user.id,
    });

    res.status(201).json({
      message: "Tim berhasil dibuat.",
      team: newTeam,
    });
  } catch (error) {
    console.error(error);
    logAktivitas({
      target: req.body.team_name || "Unknown Team",
      action: "CREATE_FAILED",
      detail: `Error: ${error.message}`,
      query: null,
      owner: req.user.id,
    });
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

exports.getAllTeams = async (req, res) => {
  try {
    const { id: userId, role: userRole } = req.user; // Diambil dari middleware verifyToken
    const { page, limit, search, event_id, instansi } = req.query;
    const { Op } = require("sequelize");

    const findOptions = {
      // Tentukan atribut yang ingin diambil secara eksplisit
      attributes: [
        "team_id",
        "team_name",
        "team_sekolah_instansi",
        "team_jumlah_anggota",
        "team_logo",
        "koordinator_id",
        "createdAt",
        "updatedAt",
        // Gunakan fungsi COUNT dari Sequelize untuk menghitung anggota tim
        [
          sequelize.fn("COUNT", sequelize.col("Anggota_teams.team_id")),
          "current_member_count",
        ],
      ],
      include: [
        {
          model: Users,
          as: "User",
          attributes: ["user_name"],
        },
        {
          model: Anggota_team,
          attributes: [], // Tidak perlu mengambil atribut dari anggota, hanya untuk join
        },
      ],
      group: ["Teams.team_id", "User.user_id"], // Kelompokkan hasil berdasarkan ID tim dan user

      order: [["createdAt", "DESC"]],
    };

    findOptions.where = {};

    if (event_id) {
      findOptions.include.push({
        model: Event_teams,
        attributes: [],
        where: { event_id },
      });
    }

    // Jika pengguna adalah koordinator, filter tim berdasarkan ID mereka
    if (userRole === "koordinator_team") {
      findOptions.where.koordinator_id = userId;
    }

    if (search) {
      findOptions.where[Op.or] = [
        { team_name: { [Op.like]: `%${search}%` } },
        { team_sekolah_instansi: { [Op.like]: `%${search}%` } },
      ];
    }

    if (instansi) {
      const searchInstansi = instansi.toUpperCase();
      if (searchInstansi === "SMA") {
        findOptions.where.team_sekolah_instansi = {
          [Op.or]: [
            { [Op.like]: "%SMA%" },
            { [Op.like]: "%SMK%" },
            { [Op.like]: "%MA %" },
            { [Op.like]: "%MAN %" },
          ],
        };
      } else if (searchInstansi === "SMP") {
        findOptions.where.team_sekolah_instansi = {
          [Op.or]: [{ [Op.like]: "%SMP%" }, { [Op.like]: "%MTS%" }],
        };
      } else if (searchInstansi === "SD") {
        findOptions.where.team_sekolah_instansi = {
          [Op.or]: [{ [Op.like]: "%SD%" }, { [Op.like]: "%MI %" }],
        };
      } else {
        // UMUM atau lainnya
        findOptions.where.team_sekolah_instansi = {
          [Op.like]: `%${instansi}%`,
        };
      }
    }

    if (page && limit) {
      const parsedLimit = parseInt(limit, 10);
      const parsedPage = parseInt(page, 10);
      const offset = (parsedPage - 1) * parsedLimit;

      findOptions.limit = parsedLimit;
      findOptions.offset = offset;
      findOptions.subQuery = false;

      const { count, rows: teams } = await Teams.findAndCountAll(findOptions);

      const totalItems = Array.isArray(count) ? count.length : count;

      return res.status(200).json({
        teams,
        totalItems,
        totalPages: Math.ceil(totalItems / parsedLimit),
        currentPage: parsedPage,
      });
    }

    const teams = await Teams.findAll(findOptions);
    res.status(200).json({ teams });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

exports.getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Teams.findByPk(id, {
      include: [
        {
          model: Event_teams,
          include: [
            {
              model: Events,
              attributes: ["event_id", "event_name", "event_tanggal"],
            },
          ],
          attributes: [
            "event_id",
            "balance",
            "xenplatform_id",
            "nomor_tampil",
            "surat_rekomendasi",
          ],
        },
        {
          model: Users,
          as: "User",
          attributes: ["user_name", "user_email"],
        },
      ],
    });
    if (!team) {
      return res.status(404).json({ message: "Tim tidak ditemukan." });
    }
    res.status(200).json({ team });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

exports.updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      team_name,
      team_sekolah_instansi,
      team_jumlah_anggota,
      koordinator_id,
    } = req.body;

    const team = await Teams.findByPk(id);
    if (!team) {
      return res.status(404).json({ message: "Tim tidak ditemukan." });
    }

    // If koordinator_id is being updated, check if the new koordinator exists and has the correct role
    if (koordinator_id && koordinator_id !== team.koordinator_id) {
      const koordinator = await Users.findOne({
        where: { user_id: koordinator_id, user_role: "koordinator_team" },
      });
      if (!koordinator) {
        return res.status(400).json({
          message: "Koordinator tidak ditemukan atau bukan koordinator.",
        });
      }
    }

    let team_logo = team.team_logo;
    let foto_all_team = team.foto_all_team;

    if (req.files && !Array.isArray(req.files)) {
      if (req.files.team_logo) {
        deleteOldLogo(team.team_logo);
        team_logo = `/uploads/teams/${req.files.team_logo[0].filename}`;
      }
      if (req.files.foto_all_team) {
        deleteOldLogo(team.foto_all_team);
        foto_all_team = `/uploads/teams/${req.files.foto_all_team[0].filename}`;
      }
    } else if (req.file) {
      if (req.file.fieldname === "team_logo") {
        deleteOldLogo(team.team_logo);
        team_logo = `/uploads/teams/${req.file.filename}`;
      }
      if (req.file.fieldname === "foto_all_team") {
        deleteOldLogo(team.foto_all_team);
        foto_all_team = `/uploads/teams/${req.file.filename}`;
      }
    }

    let executedQuery;
    const updateData = {
      team_name,
      team_sekolah_instansi,
      team_jumlah_anggota,
      team_logo,
      foto_all_team,
      koordinator_id,
    };
    await team.update(updateData, { logging: (sql) => (executedQuery = sql) });

    // Log aktivitas
    logAktivitas({
      target: id,
      action: "UPDATE",
      detail: "SUCCESS",
      query: executedQuery,
      data: updateData,
      owner: req.user.id,
    });

    res.status(200).json({ message: "Tim berhasil diperbarui.", team });
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

exports.deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Teams.findByPk(id);
    if (!team) {
      return res.status(404).json({ message: "Tim tidak ditemukan." });
    }
    let executedQuery;
    const teamName = team.team_name;
    deleteOldLogo(team.foto_all_team); // Hapus foto grup
    deleteOldLogo(team.team_logo); // Hapus logo lama
    await team.destroy({ logging: (sql) => (executedQuery = sql) });

    // Log aktivitas
    logAktivitas({
      target: id,
      action: "DELETE",
      detail: `SUCCESS - Nama: ${teamName}`,
      query: executedQuery,
      data: { id },
      owner: req.user.id,
    });

    res.status(200).json({ message: "Tim berhasil dihapus." });
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
