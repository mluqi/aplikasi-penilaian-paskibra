const {
  Team_penalties,
  Event_penalties,
  Users,
  sequelize,
} = require("../models");
const { updateRekapNilai } = require("./penilaianController");

// Menambahkan penalti ke suatu tim
exports.createTeamPenalty = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { event_id, team_id, event_penalty_id, jumlah, catatan } = req.body;
    const input_by = req.user.id; // Mengambil ID dari token user yang login

    if (!event_id || !team_id || !event_penalty_id || !jumlah || !catatan) {
      return res.status(400).json({
        message:
          "event_id, team_id, event_penalty_id, jumlah, dan catatan wajib diisi.",
      });
    }

    // Ambil detail aturan penalti event untuk mendapatkan poin potongannya
    const eventPenalty = await Event_penalties.findByPk(event_penalty_id, {
      transaction: t,
    });
    if (!eventPenalty) {
      await t.rollback();
      return res
        .status(404)
        .json({ message: "Aturan penalti event tidak ditemukan." });
    }

    // Kalkulasi total pemotongan
    const total_pengurangan = jumlah * eventPenalty.poin_potongan;

    // Buat data pelanggaran tim
    const newPenalty = await Team_penalties.create(
      {
        event_id,
        team_id,
        event_penalty_id,
        jumlah,
        total_pengurangan,
        catatan,
        input_by,
      },
      { transaction: t },
    );

    // Hitung ulang Rekapitulasi Nilai Akhir tim tersebut
    await updateRekapNilai(event_id, team_id, t);

    await t.commit();

    res.status(201).json({
      message: "Penalti berhasil ditambahkan dan nilai akhir telah diperbarui.",
      data: newPenalty,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error creating team penalty:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan server.", error: error.message });
  }
};

// Mendapatkan daftar penalti berdasarkan event dan tim
exports.getTeamPenalties = async (req, res) => {
  try {
    const { event_id, team_id } = req.params;

    const penalties = await Team_penalties.findAll({
      where: { event_id, team_id },
      include: [
        {
          model: Event_penalties,
          as: "event_penalty",
          attributes: ["nama_pelanggaran", "poin_potongan"],
        },
        { model: Users, as: "users", attributes: ["user_name"] },
      ],
    });

    res.status(200).json({ data: penalties });
  } catch (error) {
    console.error("Error fetching team penalties:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

// ==========================================
// CRUD EVENT PENALTIES (Penalti yang Aktif di Event)
// ==========================================

// Mendapatkan daftar penalti yang berlaku untuk suatu event
exports.getEventPenalties = async (req, res) => {
  try {
    const { event_id } = req.params;
    const data = await Event_penalties.findAll({
      where: { event_id },
    });
    res.status(200).json({ data });
  } catch (error) {
    console.error("Error fetching event penalties:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

// Menambahkan aturan penalti baru ke event tertentu
exports.addEventPenalty = async (req, res) => {
  try {
    const { event_id, nama_pelanggaran, poin_potongan } = req.body;
    if (!event_id || !nama_pelanggaran || poin_potongan === undefined) {
      return res
        .status(400)
        .json({
          message: "event_id, nama_pelanggaran, dan poin_potongan wajib diisi.",
        });
    }
    const existing = await Event_penalties.findOne({
      where: { event_id, nama_pelanggaran },
    });
    if (existing) {
      return res.status(400).json({
        message: "Aturan penalti dengan nama tersebut sudah ada di event ini.",
      });
    }
    const newEventPenalty = await Event_penalties.create({
      event_id,
      nama_pelanggaran,
      poin_potongan,
    });
    res.status(201).json({
      message: "Penalti berhasil diaktifkan pada event.",
      data: newEventPenalty,
    });
  } catch (error) {
    console.error("Error adding event penalty:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

// Menghapus penalti dari event
exports.removeEventPenalty = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Event_penalties.findByPk(id);
    if (!record) {
      return res.status(404).json({ message: "Data tidak ditemukan." });
    }
    await record.destroy();
    res
      .status(200)
      .json({ message: "Penalti berhasil dinonaktifkan dari event." });
  } catch (error) {
    console.error("Error removing event penalty:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

// Menghapus sebuah penalti
exports.deleteTeamPenalty = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const penaltyRecord = await Team_penalties.findByPk(id, { transaction: t });
    if (!penaltyRecord) {
      await t.rollback();
      return res.status(404).json({ message: "Data penalti tidak ditemukan." });
    }
    const { event_id, team_id } = penaltyRecord;
    await penaltyRecord.destroy({ transaction: t });
    // Hitung ulang rekap setelah penalti dihapus
    await updateRekapNilai(event_id, team_id, t);
    await t.commit();
    res.status(200).json({
      message: "Penalti berhasil dihapus dan nilai akhir telah dikembalikan.",
    });
  } catch (error) {
    await t.rollback();
    console.error("Error deleting team penalty:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};
