const { Anggota_team, Teams, sequelize } = require("../models");
const { Op } = require("sequelize");
const { logAktivitas } = require("../services/logService");

/**
 * Menambahkan anggota baru ke dalam sebuah tim.
 * Secara otomatis akan menambah `team_jumlah_anggota` di tabel Teams.
 */
exports.createAnggota = async (req, res) => {
  const { team_id } = req.params;
  const {
    anggota_nama,
    anggota_tempat_lahir,
    anggota_tanggal_lahir,
    anggota_is_danton,
  } = req.body;

  const t = await sequelize.transaction();
  try {
    const team = await Teams.findByPk(team_id, { transaction: t });
    if (!team) {
      await t.rollback();
      return res.status(404).json({ message: "Tim tidak ditemukan." });
    }

    // Validasi: Pastikan jumlah anggota tidak melebihi batas maksimal
    const currentAnggotaCount = await Anggota_team.count({
      where: { team_id },
      transaction: t,
    });
    if (currentAnggotaCount >= team.team_jumlah_anggota) {
      await t.rollback();
      return res.status(400).json({
        message: `Tim sudah penuh. Batas maksimal adalah ${team.team_jumlah_anggota} anggota.`,
      });
    }

    // Validasi: Pastikan hanya ada satu danton per tim
    if (anggota_is_danton) {
      const existingDanton = await Anggota_team.findOne({
        where: { team_id, anggota_is_danton: true },
        transaction: t,
      });

      if (existingDanton) {
        await t.rollback();
        return res.status(400).json({
          message:
            "Danton untuk tim ini sudah ada. Hanya boleh ada satu danton per tim.",
        });
      }
    }

    // Generate ID unik untuk anggota
    const lastAnggota = await Anggota_team.findOne(
      { order: [["createdAt", "DESC"]] },
      { transaction: t }
    );
    let anggota_id = "AGT0001";
    if (lastAnggota) {
      const lastIdNum = parseInt(lastAnggota.anggota_id.replace("AGT", ""), 10);
      anggota_id = "AGT" + (lastIdNum + 1).toString().padStart(4, "0");
    }

    let executedQuery;
    const createData = {
      anggota_id,
      anggota_nama,
      anggota_tempat_lahir,
      anggota_tanggal_lahir,
      anggota_is_danton: anggota_is_danton || false,
      team_id,
    };
    const newAnggota = await Anggota_team.create(createData, {
      transaction: t,
      logging: (sql) => (executedQuery = sql),
    });

    await t.commit();

    // Log aktivitas
    logAktivitas({
      target: newAnggota.anggota_id,
      action: "CREATE",
      detail: `SUCCESS - Added to Team ID: ${team_id}`,
      query: executedQuery,
      data: createData,
      owner: req.user.id,
    });

    res.status(201).json({
      message: "Anggota tim berhasil ditambahkan.",
      anggota: newAnggota,
    });
  } catch (error) {
    await t.rollback();
    console.error(error);
    logAktivitas({
      target: team_id,
      action: "CREATE_ANGGOTA_FAILED",
      detail: `Error: ${error.message}`,
      query: null,
      owner: req.user.id,
    });
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Mendapatkan semua anggota dari sebuah tim.
 */
exports.getAllAnggotaByTeam = async (req, res) => {
  try {
    const { team_id } = req.params;
    const anggota = await Anggota_team.findAll({ where: { team_id } });
    res.status(200).json({ anggota });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Mengupdate data seorang anggota tim.
 */
exports.updateAnggota = async (req, res) => {
  try {
    const { anggota_id } = req.params;
    const {
      anggota_nama,
      anggota_tempat_lahir,
      anggota_tanggal_lahir,
      anggota_is_danton,
    } = req.body;

    const anggota = await Anggota_team.findByPk(anggota_id);
    if (!anggota) {
      return res.status(404).json({ message: "Anggota tidak ditemukan." });
    }

    // Validasi: Jika akan mengubah menjadi danton, pastikan belum ada danton lain
    if (anggota_is_danton && anggota.anggota_is_danton === false) {
      const existingDanton = await Anggota_team.findOne({
        where: {
          team_id: anggota.team_id,
          anggota_is_danton: true,
          // Pastikan tidak memeriksa anggota yang sedang diupdate itu sendiri
          anggota_id: { [Op.ne]: anggota_id },
        },
      });

      if (existingDanton) {
        return res.status(400).json({
          message: "Gagal update. Danton untuk tim ini sudah ada.",
        });
      }
    }

    let executedQuery;
    const updateData = {
      anggota_nama,
      anggota_tempat_lahir,
      anggota_tanggal_lahir,
      anggota_is_danton,
    };
    await anggota.update(updateData, {
      logging: (sql) => (executedQuery = sql),
    });

    // Log aktivitas
    logAktivitas({
      target: anggota_id,
      action: "UPDATE",
      detail: "SUCCESS",
      query: executedQuery,
      data: updateData,
      owner: req.user.id,
    });

    res.status(200).json({
      message: "Data anggota berhasil diperbarui.",
      anggota,
    });
  } catch (error) {
    console.error(error);
    logAktivitas({
      target: req.params.anggota_id,
      action: "UPDATE_ANGGOTA_FAILED",
      detail: `Error: ${error.message}`,
      query: null,
      owner: req.user.id,
    });
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Menghapus seorang anggota dari tim.
 * Secara otomatis akan mengurangi `team_jumlah_anggota` di tabel Teams.
 */
exports.deleteAnggota = async (req, res) => {
  const { anggota_id } = req.params;
  const t = await sequelize.transaction();

  try {
    const anggota = await Anggota_team.findByPk(anggota_id, { transaction: t });
    if (!anggota) {
      await t.rollback();
      return res.status(404).json({ message: "Anggota tidak ditemukan." });
    }

    const team = await Teams.findByPk(anggota.team_id, { transaction: t });

    let executedQuery;
    const anggotaNama = anggota.anggota_nama;
    await anggota.destroy({
      transaction: t,
      logging: (sql) => (executedQuery = sql),
    });

    await t.commit();

    logAktivitas({
      target: anggota_id,
      action: "DELETE",
      detail: `SUCCESS - Nama: ${anggotaNama}`,
      query: executedQuery,
      data: { anggota_id },
      owner: req.user.id,
    });
    res.status(200).json({ message: "Anggota tim berhasil dihapus." });
  } catch (error) {
    await t.rollback();
    console.error(error);
    logAktivitas({
      target: req.params.anggota_id,
      action: "DELETE_ANGGOTA_FAILED",
      detail: `Error: ${error.message}`,
      query: null,
      owner: req.user.id,
    });
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};
