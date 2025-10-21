const { Teams, Users, Anggota_team, sequelize } = require("../models");
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
    const lastTeam = await Teams.findOne({ order: [["createdAt", "DESC"]] });
    let team_id = "TM0001";
    if (lastTeam) {
      const lastIdNum = parseInt(lastTeam.team_id.replace("TM", ""), 10);
      const newIdNum = lastIdNum + 1;
      team_id = "TM" + newIdNum.toString().padStart(4, "0");
    }

    // Dapatkan path logo jika diunggah
    let team_logo = null;
    if (req.file) {
      team_logo = `/uploads/teams/${req.file.filename}`;
    }

    let executedQuery;
    const createData = {
      team_id,
      team_name,
      team_sekolah_instansi,
      team_jumlah_anggota,
      team_logo,
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

    // Jika pengguna adalah koordinator, filter tim berdasarkan ID mereka
    if (userRole === "koordinator_team") {
      findOptions.where = { koordinator_id: userId };
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
    const team = await Teams.findByPk(id);
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
    if (req.file) {
      // Hapus logo lama jika ada
      deleteOldLogo(team.team_logo);
      team_logo = `/uploads/teams/${req.file.filename}`;
    }

    let executedQuery;
    const updateData = {
      team_name,
      team_sekolah_instansi,
      team_jumlah_anggota,
      team_logo,
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
