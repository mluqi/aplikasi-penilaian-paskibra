const {
  Penilaian,
  AspekNilais,
  SubAspekNilais,
  Aspeks,
  SubAspeks,
  Users,
  Teams,
  RekapNilai,
  Events,
  Event_juri,
  Team_penalties,
  Event_penalties,
  sequelize,
} = require("../models");

const { Op } = require("sequelize");

const generateRekapNilaiId = async (event_id, team_id) => {
  const lastRekap = await RekapNilai.findOne({
    order: [["rekapnilai_id", "DESC"]],
  });

  if (!lastRekap) {
    return `REK-${event_id}-${team_id}-001`;
  } else {
    const lastIdNum = parseInt(lastRekap.rekapnilai_id.split("-").pop(), 10);
    const newIdNum = lastIdNum + 1;
    return `REK-${event_id}-${team_id}-${newIdNum.toString().padStart(3, "0")}`;
  }
};

// modifikasi agar seperti ini PEN-{EVENTID}-{TEAMID}-{0001, 0002, dst}
const generatePenilaianId = async (event_id, team_id) => {
  const lastPenilaian = await Penilaian.findOne({
    where: {
      event_id,
      team_id,
    },
    order: [["penilaian_id", "DESC"]],
  });

  if (!lastPenilaian) {
    return `PEN-${event_id}-${team_id}-001`;
  } else {
    const lastIdNum = parseInt(lastPenilaian.penilaian_id.split("-").pop(), 10);
    const newIdNum = lastIdNum + 1;
    return `PEN-${event_id}-${team_id}-${newIdNum.toString().padStart(3, "0")}`;
  }
};

// Helper function for pagination
const getPagination = (page, limit) => {
  const offset = page ? (page - 1) * limit : 0;
  return { limit, offset };
};

// Helper function to format paginated data
const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows } = data;
  const currentPage = page ? +page : 1;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, data: rows, totalPages, currentPage };
};

// Fungsi untuk mendapatkan semua penilaian
exports.getAllPenilaian = async (req, res) => {
  try {
    const { page = 1, limit = 10, event_id, team_id, juri_id } = req.query;

    const whereClause = {};
    if (event_id) whereClause.event_id = event_id;
    if (team_id) whereClause.team_id = team_id;
    if (juri_id) whereClause.juri_id = juri_id;

    const { limit: queryLimit, offset } = getPagination(page, parseInt(limit));

    const penilaiansData = await Penilaian.findAndCountAll({
      where: whereClause,
      include: [
        { model: Users, attributes: ["user_id", "user_name"] }, // Changed 'name' to 'user_name' based on Users model
        { model: Teams, attributes: ["team_id", "team_name"] },
        { model: Events, attributes: ["event_id", "event_name"] },
      ],
      limit: queryLimit,
      offset,
    });

    const response = getPagingData(penilaiansData, page, queryLimit);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching penilaians:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getPenilaianById = async (req, res) => {
  const { id } = req.params;
  try {
    const penilaian = await Penilaian.findByPk(id, {
      include: [
        {
          model: AspekNilais,
          include: [
            { model: SubAspekNilais, include: [SubAspeks] },
            { model: Aspeks },
          ],
        },
        { model: Users, attributes: ["user_id", "user_name"] }, // Changed 'name' to 'user_name' based on Users model
        { model: Teams, attributes: ["team_id", "team_name"] },
        { model: Events, attributes: ["event_id", "event_name"] },
      ],
    });

    if (!penilaian) {
      return res.status(404).json({ message: "Penilaian not found" });
    }

    res.status(200).json(penilaian);
  } catch (error) {
    console.error("Error fetching penilaian by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getPenilaianDetailByTeam = async (req, res) => {
  const { event_id, team_id } = req.params;
  const { id: userId, role: userRole } = req.user;
  if (!event_id || !team_id) {
    return res
      .status(400)
      .json({ message: "Event ID dan Team ID diperlukan." });
  }

  try {
    const whereClause = { event_id, team_id };
    // Jika yang meminta adalah juri, filter hanya penilaian dari juri tersebut
    if (userRole === "juri") {
      whereClause.juri_id = userId;
    }
    // Menggunakan Promise.all untuk mengambil data secara paralel
    const [penilaianDetails, rekapSummary, aspectSummary, teamPenalties] =
      await Promise.all([
        // 1. Ambil detail penilaian dari setiap juri
        Penilaian.findAll({
          where: whereClause,
          include: [
            {
              model: Users,
              as: "User",
              attributes: ["user_id", "user_name", "user_photo"],
            },
            {
              model: Users,
              as: "Asisten",
              attributes: ["user_id", "user_name"],
            },
            {
              model: AspekNilais,
              include: [
                {
                  model: SubAspekNilais,
                  include: [
                    {
                      model: SubAspeks,
                      attributes: ["subaspek_id", "nama_subaspek", "kategori"],
                    },
                  ],
                },
                { model: Aspeks, attributes: ["nama_aspek"] },
              ],
            },
            {
              model: Teams,
              attributes: ["team_id", "team_name", "team_sekolah_instansi"],
            },
            { model: Events, attributes: ["event_id", "event_name"] },
          ],
          order: [
            ["juri_id", "ASC"],
            [AspekNilais, "aspek_id", "ASC"],
          ],
        }),
        // 2. Ambil data rekapitulasi akhir
        RekapNilai.findOne({
          where: { event_id, team_id },
        }),
        // 3. Ambil total penjumlahan nilai per aspek dari semua juri
        AspekNilais.findAll({
          attributes: [
            [sequelize.fn("SUM", sequelize.col("nilai_aspek")), "total_score"],
          ],
          include: [
            {
              model: Penilaian,
              attributes: [],
              where: { event_id, team_id },
              required: true,
            },
            {
              model: Aspeks,
              attributes: ["nama_aspek"],
              required: true,
            },
          ],
          group: ["Aspek.aspek_id"],
          order: [[Aspeks, "urutan", "ASC"]],
          raw: true,
        }),
        // 4. Ambil detail penalti spesifik untuk tim ini
        Team_penalties.findAll({
          where: { event_id, team_id },
          include: [
            {
              model: Event_penalties,
              as: "event_penalty",
              attributes: ["nama_pelanggaran", "poin_potongan"],
            },
          ],
        }),
      ]);

    res.status(200).json({
      details: penilaianDetails,
      summary: {
        ...(rekapSummary ? rekapSummary.toJSON() : {}),
        penalty_details: teamPenalties,
      },
      aspectSummary,
    });
  } catch (error) {
    console.error("Error fetching penilaian detail by team:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Mendapatkan daftar ID tim yang sudah dinilai oleh juri tertentu pada sebuah event.
 */
exports.getSubmittedTeams = async (req, res) => {
  try {
    const { event_id } = req.query;
    let { id: juri_id, role: userRole } = req.user;

    // Jika Asisten Juri, juri_id yang dicari berasal dari query parameter (jika ada)
    if (userRole === "asisten_juri" && req.query.juri_id) {
      juri_id = req.query.juri_id;
    }

    if (!event_id) {
      return res.status(400).json({ message: "event_id diperlukan." });
    }

    const submissions = await Penilaian.findAll({
      where: { event_id, juri_id },
      // Ambil atribut yang dibutuhkan oleh frontend untuk status lock dan edit
      attributes: ["penilaian_id", "team_id", "is_lock"],
    });

    // Kembalikan data dalam format yang diharapkan oleh frontend
    res.status(200).json({ submissions });
  } catch (error) {
    console.error("Error fetching submitted teams:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Mengunci sebuah penilaian agar tidak bisa diedit lagi.
 */
exports.lockPenilaian = async (req, res) => {
  const { id: userId, role: userRole } = req.user;
  const { penilaian_id } = req.params;

  try {
    const penilaian = await Penilaian.findByPk(penilaian_id);

    if (!penilaian) {
      return res.status(404).json({
        message:
          "Penilaian tidak ditemukan atau Anda tidak berhak mengaksesnya.",
      });
    }

    if (userRole === "juri" && penilaian.juri_id !== userId) {
      return res
        .status(403)
        .json({ message: "Anda tidak berhak mengaksesnya." });
    }

    penilaian.is_lock = true;
    await penilaian.save();

    res.status(200).json({ message: "Penilaian berhasil dikunci." });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan pada server.",
      error: error.message,
    });
  }
};

/**
 * Membuka kunci penilaian oleh Admin.
 */
exports.unlockPenilaian = async (req, res) => {
  const { penilaian_id } = req.params;

  try {
    const penilaian = await Penilaian.findByPk(penilaian_id);

    if (!penilaian) {
      return res.status(404).json({ message: "Penilaian tidak ditemukan." });
    }

    penilaian.is_lock = false;
    await penilaian.save();

    res
      .status(200)
      .json({ message: "Penilaian berhasil dibuka.", data: penilaian });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan pada server.",
      error: error.message,
    });
  }
};

/**
 * Controller untuk memperbarui data penilaian yang sudah ada.
 */
exports.updatePenilaian = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { penilaian_id } = req.params;
    const { catatan, penilaian_detail, event_id, team_id } = req.body;
    let { id: juriId, role: userRole } = req.user;
    let asistenId = null;

    if (userRole === "asisten_juri") {
      juriId = req.body.juri_id || juriId;
      asistenId = req.user.id;
    }

    // 1. Cari penilaian yang ada
    const penilaian = await Penilaian.findOne({
      where: { penilaian_id, juri_id: juriId },
      transaction: t,
    });

    if (!penilaian) {
      await t.rollback();
      return res.status(404).json({ message: "Penilaian tidak ditemukan." });
    }

    // 2. Cek apakah sudah dikunci
    if (penilaian.is_lock) {
      await t.rollback();
      return res
        .status(403)
        .json({ message: "Penilaian terkunci dan tidak dapat diubah." });
    }

    // 2.5 Validasi Otorisasi Juri terhadap Aspek
    const juriAssignment = await Event_juri.findOne({
      where: { event_id, juri_id: juriId },
      include: [{ model: Aspeks }],
      transaction: t,
    });

    if (
      !juriAssignment ||
      !juriAssignment.Aspeks ||
      juriAssignment.Aspeks.length === 0
    ) {
      await t.rollback();
      return res.status(403).json({
        message:
          "Anda belum ditugaskan untuk menilai aspek apapun di event ini.",
      });
    }

    const allowedAspekIds = new Set(
      juriAssignment.Aspeks.map((a) => a.aspek_id),
    );

    // 3. Hapus detail nilai lama (AspekNilais dan SubAspekNilais terkait akan terhapus via cascade)
    await AspekNilais.destroy({ where: { penilaian_id }, transaction: t });

    let total_nilai_keseluruhan = 0;
    const aspekNilaiRecords = [];

    // 4. Hitung ulang nilai berdasarkan data baru (Penjumlahan Langsung)
    for (const detail of penilaian_detail) {
      if (!allowedAspekIds.has(detail.aspek_id)) {
        await t.rollback();
        return res.status(403).json({
          message: `Akses ditolak: Anda tidak berhak menilai aspek ID ${detail.aspek_id}.`,
        });
      }

      let nilai_aspek_sum = 0;
      for (const sub of detail.sub_aspek_nilai) {
        nilai_aspek_sum += parseInt(sub.nilai || 0, 10);
      }

      aspekNilaiRecords.push({
        penilaian_id,
        aspek_id: detail.aspek_id,
        nilai_aspek: nilai_aspek_sum,
        SubAspekNilais: detail.sub_aspek_nilai.map((sub) => ({
          subaspek_id: sub.subaspek_id,
          nilai: sub.nilai,
        })),
      });

      total_nilai_keseluruhan += nilai_aspek_sum;
    }

    // 6. Update record Penilaian utama
    penilaian.total_nilai = total_nilai_keseluruhan;
    penilaian.catatan = catatan;
    penilaian.asisten_id = asistenId; // Null jika diupdate oleh Juri Utama, terisi jika diupdate oleh Asisten
    await penilaian.save({ transaction: t });

    // 7. Buat ulang record AspekNilais dan SubAspekNilais
    await AspekNilais.bulkCreate(aspekNilaiRecords, {
      include: [SubAspekNilais],
      transaction: t,
    });

    // 8. Update rekap nilai akhir
    await updateRekapNilai(event_id, team_id, t);

    await t.commit();

    // 9. Ambil data terbaru untuk dikirim sebagai respons
    const result = await Penilaian.findByPk(penilaian_id, {
      include: [
        { model: Users, attributes: ["user_id", "user_name"] },
        { model: Teams, attributes: ["team_id", "team_name"] },
        {
          model: AspekNilais,
          include: [
            { model: SubAspekNilais, include: [SubAspeks] },
            { model: Aspeks },
          ],
        },
      ],
    });

    res.status(200).json({
      message: `Nilai untuk tim ${result.Team.team_name} berhasil diperbarui.`,
      data: result,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error saat memperbarui penilaian:", error);
    res.status(500).json({
      message: "Terjadi kesalahan pada server.",
      error: error.message,
    });
  }
};

/**
 * Helper function untuk mengupdate atau membuat rekap nilai akhir.
 * Fungsi ini harus dipanggil di dalam sebuah transaksi.
 * @param {string} event_id - ID Event
 * @param {string} team_id - ID Tim
 * @param {object} transaction - Objek transaksi Sequelize
 */
const updateRekapNilai = async (event_id, team_id, transaction) => {
  const allPenilaianForTeam = await Penilaian.findAll({
    where: { event_id, team_id },
    attributes: ["total_nilai"],
    transaction,
  });

  const jumlah_juri = allPenilaianForTeam.length;

  // 2. Cari rekap yang sudah ada untuk tim ini di event ini
  let rekap = await RekapNilai.findOne({
    where: { event_id, team_id },
    transaction,
  });

  if (jumlah_juri === 0) {
    // Jika tidak ada penilaian lagi (misal, semua dihapus), hapus rekapnya
    if (rekap) {
      await rekap.destroy({ transaction });
    }
  } else {
    // Menghitung nilai akhir:
    // Menjumlahkan (SUM) semua nilai dari semua juri yang masuk.
    const aspekNilais = await AspekNilais.findAll({
      attributes: [
        "aspek_id",
        [
          sequelize.fn("SUM", sequelize.col("nilai_aspek")),
          "total_nilai_aspek",
        ],
      ],
      include: [
        {
          model: Penilaian,
          attributes: [],
          where: { event_id, team_id },
          required: true,
        },
        {
          model: Aspeks,
          attributes: [],
          required: true,
        },
      ],
      group: ["AspekNilais.aspek_id"],
      transaction,
    });

    // Menghitung total pengurangan penalti untuk tim ini
    const totalPenalti = await Team_penalties.sum("total_pengurangan", {
      where: { event_id, team_id },
      transaction,
    });

    // Pastikan angka absolut untuk mencegah kasus double minus (--15 jadi +15)
    const pengurangan = totalPenalti ? Math.abs(totalPenalti) : 0;

    let nilai_akhir = 0;
    aspekNilais.forEach((record) => {
      const sum_nilai = parseInt(
        record.getDataValue("total_nilai_aspek") || 0,
        10,
      );
      nilai_akhir += sum_nilai; // Penjumlahan total semua nilai aspek
    });

    // Kurangi nilai akhir dengan jumlah penalti
    nilai_akhir -= pengurangan;

    if (rekap) {
      // Jika rekap sudah ada, UPDATE
      await rekap.update(
        {
          nilai_akhir,
          jumlah_juri,
        },
        { transaction },
      );
    } else {
      // Jika rekap belum ada, CREATE
      const rekapnilai_id = await generateRekapNilaiId(event_id, team_id);
      await RekapNilai.create(
        {
          rekapnilai_id,
          event_id,
          team_id,
          nilai_akhir,
          jumlah_juri,
        },
        { transaction },
      );
    }
  }
};

exports.updateRekapNilai = updateRekapNilai;

/**
 * Controller untuk membuat data penilaian baru beserta detail aspek dan sub-aspeknya.
 * Proses ini menggunakan transaksi untuk memastikan integritas data.
 */
exports.createPenilaian = async (req, res) => {
  // Memulai transaksi database
  const t = await sequelize.transaction();

  try {
    const { event_id, team_id, catatan, penilaian_detail } = req.body;
    let { id: juriId, role: userRole } = req.user;
    let asistenId = null;

    if (userRole === "asisten_juri") {
      juriId = req.body.juri_id || juriId;
      asistenId = req.user.id;
    }

    if (!juriId) {
      await t.rollback();
      return res.status(400).json({ message: "juri_id tidak ditemukan." });
    }

    // 1. Validasi input dasar
    if (!event_id || !team_id || !penilaian_detail) {
      await t.rollback();
      return res.status(400).json({
        message: "event_id, team_id dan penilaian_detail tidak boleh kosong.",
      });
    }

    // 1.2 Mencegah Double Input (Cek apakah juri sudah pernah menilai tim ini)
    const existingPenilaian = await Penilaian.findOne({
      where: { event_id, team_id, juri_id: juriId },
      transaction: t,
    });
    if (existingPenilaian) {
      await t.rollback();
      return res.status(409).json({
        message:
          "Anda sudah memberikan penilaian untuk tim ini. Gunakan fitur update atau muat ulang halaman.",
      });
    }

    // 1.5 Validasi Otorisasi Juri terhadap Aspek
    const juriAssignment = await Event_juri.findOne({
      where: { event_id, juri_id: juriId },
      include: [{ model: Aspeks }],
      transaction: t,
    });

    if (
      !juriAssignment ||
      !juriAssignment.Aspeks ||
      juriAssignment.Aspeks.length === 0
    ) {
      await t.rollback();
      return res.status(403).json({
        message:
          "Anda belum ditugaskan untuk menilai aspek apapun di event ini.",
      });
    }

    const allowedAspekIds = new Set(
      juriAssignment.Aspeks.map((a) => a.aspek_id),
    );

    let total_nilai_keseluruhan = 0;
    const aspekNilaiRecords = [];

    // 2. Iterasi setiap aspek yang dinilai dari input (Penjumlahan Langsung)
    for (const detail of penilaian_detail) {
      if (!allowedAspekIds.has(detail.aspek_id)) {
        await t.rollback();
        return res.status(403).json({
          message: `Akses ditolak: Anda tidak berhak menilai aspek ID ${detail.aspek_id}.`,
        });
      }

      let nilai_aspek_sum = 0;
      for (const sub of detail.sub_aspek_nilai) {
        nilai_aspek_sum += parseInt(sub.nilai || 0, 10);
      }

      aspekNilaiRecords.push({
        aspek_id: detail.aspek_id,
        nilai_aspek: nilai_aspek_sum,
        SubAspekNilais: detail.sub_aspek_nilai.map((sub) => ({
          subaspek_id: sub.subaspek_id,
          nilai: sub.nilai,
        })),
      });

      total_nilai_keseluruhan += nilai_aspek_sum;
    }

    // 3. Membuat record utama di tabel Penilaians
    const penilaianHeader = await Penilaian.create(
      {
        penilaian_id: await generatePenilaianId(event_id, team_id),
        event_id,
        team_id,
        juri_id: juriId,
        asisten_id: asistenId,
        total_nilai: total_nilai_keseluruhan,
        catatan,
        AspekNilais: aspekNilaiRecords,
      },
      {
        include: [
          {
            model: AspekNilais,
            include: [SubAspekNilais],
          },
        ],
        transaction: t, // Menjalankan semua proses dalam satu transaksi
      },
    );

    // 5. Update atau buat rekap nilai akhir untuk tim ini
    await updateRekapNilai(event_id, team_id, t);

    // 5. Jika semua berhasil, commit transaksi
    await t.commit();

    // 7. Mengambil kembali data yang baru dibuat untuk respons
    const result = await Penilaian.findByPk(penilaianHeader.penilaian_id, {
      include: [
        {
          model: Teams,
          attributes: ["team_id", "team_name"],
        },
        {
          model: AspekNilais,
          include: [
            { model: SubAspekNilais, include: [SubAspeks] },
            { model: Aspeks },
          ],
        },
      ],
    });

    res.status(201).json({
      message: `Nilai untuk tim ${result.Team.team_name} berhasil disimpan.`,
      data: result,
    });
  } catch (error) {
    // 8. Jika terjadi error, rollback semua perubahan
    await t.rollback();
    console.error("Error saat membuat penilaian:", error);
    res.status(500).json({
      message: "Terjadi kesalahan pada server.",
      error: error.message,
    });
  }
};
