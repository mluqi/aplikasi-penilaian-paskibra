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
    const [penilaianDetails, rekapSummary, aspectSummary] = await Promise.all([
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
            model: AspekNilais,
            include: [
              {
                model: SubAspekNilais,
                include: [{ model: SubAspeks, attributes: ["nama_subaspek"] }],
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
      // 3. Ambil rata-rata nilai per aspek
      AspekNilais.findAll({
        attributes: [
          [sequelize.fn("AVG", sequelize.col("nilai_aspek")), "avg_score"],
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
    ]);

    res.status(200).json({
      details: penilaianDetails,
      summary: rekapSummary,
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
    const { id: juri_id } = req.user;

    if (!event_id || !juri_id) {
      return res
        .status(400)
        .json({ message: "event_id dan juri_id diperlukan." });
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
  const { id: juriId } = req.user;
  const { penilaian_id } = req.params;

  try {
    const penilaian = await Penilaian.findOne({
      where: { penilaian_id, juri_id: juriId },
    });

    if (!penilaian) {
      return res.status(404).json({
        message:
          "Penilaian tidak ditemukan atau Anda tidak berhak mengaksesnya.",
      });
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
    const { id: juriId } = req.user;

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

    // 3. Hapus detail nilai lama (AspekNilais dan SubAspekNilais terkait akan terhapus via cascade)
    await AspekNilais.destroy({ where: { penilaian_id }, transaction: t });

    let total_nilai_keseluruhan = 0;
    const aspekNilaiRecords = [];

    // 4. Ambil data master Aspek dan SubAspek untuk perhitungan bobot
    const masterAspeks = await Aspeks.findAll({
      where: { event_id },
      include: [{ model: SubAspeks, as: "SubAspeks" }],
      transaction: t,
    });

    const aspekBobotMap = new Map(
      masterAspeks.map((a) => [a.aspek_id, parseFloat(a.bobot)])
    );
    const subAspekBobotMap = new Map();
    masterAspeks.forEach((aspek) => {
      aspek.SubAspeks.forEach((sub) => {
        subAspekBobotMap.set(sub.subaspek_id, parseFloat(sub.bobot));
      });
    });

    // 5. Hitung ulang nilai berdasarkan data baru
    for (const detail of penilaian_detail) {
      let nilai_aspek_terbobot = 0;
      for (const sub of detail.sub_aspek_nilai) {
        const bobotSubAspek = subAspekBobotMap.get(sub.subaspek_id);
        if (bobotSubAspek === undefined)
          throw new Error(`Sub-Aspek ID ${sub.subaspek_id} tidak ditemukan.`);
        nilai_aspek_terbobot += (parseFloat(sub.nilai) * bobotSubAspek) / 100;
      }

      aspekNilaiRecords.push({
        penilaian_id,
        aspek_id: detail.aspek_id,
        nilai_aspek: nilai_aspek_terbobot,
        SubAspekNilais: detail.sub_aspek_nilai.map((sub) => ({
          subaspek_id: sub.subaspek_id,
          nilai: sub.nilai,
        })),
      });

      const bobotAspek = aspekBobotMap.get(detail.aspek_id);
      if (bobotAspek === undefined)
        throw new Error(`Aspek ID ${detail.aspek_id} tidak ditemukan.`);
      total_nilai_keseluruhan += (nilai_aspek_terbobot * bobotAspek) / 100;
    }

    // 6. Update record Penilaian utama
    penilaian.total_nilai = total_nilai_keseluruhan.toFixed(2);
    penilaian.catatan = catatan;
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
    // Jika ada penilaian, hitung ulang dan update/create rekap
    const totalNilaiSum = allPenilaianForTeam.reduce(
      (sum, p) => sum + parseFloat(p.total_nilai),
      0
    );
    const nilai_akhir = totalNilaiSum / jumlah_juri;

    if (rekap) {
      // Jika rekap sudah ada, UPDATE
      await rekap.update(
        {
          nilai_akhir: parseFloat(nilai_akhir.toFixed(2)),
          jumlah_juri,
        },
        { transaction }
      );
    } else {
      // Jika rekap belum ada, CREATE
      const rekapnilai_id = await generateRekapNilaiId(event_id, team_id);
      await RekapNilai.create(
        {
          rekapnilai_id,
          event_id,
          team_id,
          nilai_akhir: parseFloat(nilai_akhir.toFixed(2)),
          jumlah_juri,
        },
        { transaction }
      );
    }
  }
};

/**
 * Controller untuk membuat data penilaian baru beserta detail aspek dan sub-aspeknya.
 * Proses ini menggunakan transaksi untuk memastikan integritas data.
 */
exports.createPenilaian = async (req, res) => {
  // Memulai transaksi database
  const t = await sequelize.transaction();

  try {
    const { event_id, team_id, catatan, penilaian_detail } = req.body;
    const { id: juriId } = req.user;

    if (!juriId) {
      return res
        .status(400)
        .json({ message: "juri_id tidak ditemukan dari token." });
    }

    // 1. Validasi input dasar
    if (!event_id || !team_id || !penilaian_detail) {
      return res.status(400).json({
        message: "event_id, team_id dan penilaian_detail tidak boleh kosong.",
      });
    }

    let total_nilai_keseluruhan = 0;
    const aspekNilaiRecords = [];

    // 2. Mengambil semua data master Aspek dan SubAspek untuk perhitungan bobot
    const masterAspeks = await Aspeks.findAll({
      where: { event_id }, // Filter aspek berdasarkan event_id
      include: [{ model: SubAspeks, as: "SubAspeks" }],
      transaction: t,
    });

    // Membuat map untuk akses cepat ke bobot
    const aspekBobotMap = new Map(
      masterAspeks.map((a) => [a.aspek_id, parseFloat(a.bobot)])
    );
    const subAspekBobotMap = new Map();
    masterAspeks.forEach((aspek) => {
      aspek.SubAspeks.forEach((sub) => {
        subAspekBobotMap.set(sub.subaspek_id, parseFloat(sub.bobot));
      });
    });

    // 3. Iterasi setiap aspek yang dinilai dari input
    for (const detail of penilaian_detail) {
      let nilai_aspek_terbobot = 0;

      // Iterasi setiap sub-aspek di dalam aspek
      for (const sub of detail.sub_aspek_nilai) {
        const bobotSubAspek = subAspekBobotMap.get(sub.subaspek_id);
        if (bobotSubAspek === undefined) {
          throw new Error(
            `Sub-Aspek dengan ID ${sub.subaspek_id} tidak ditemukan.`
          );
        }
        // Menghitung nilai sub-aspek yang sudah dikalikan bobotnya
        nilai_aspek_terbobot += (parseFloat(sub.nilai) * bobotSubAspek) / 100;
      }

      // Menyiapkan data untuk tabel AspekNilais
      aspekNilaiRecords.push({
        aspek_id: detail.aspek_id,
        nilai_aspek: nilai_aspek_terbobot,
        // Menyimpan detail sub-aspek untuk dibuat nanti
        SubAspekNilais: detail.sub_aspek_nilai.map((sub) => ({
          subaspek_id: sub.subaspek_id,
          nilai: sub.nilai,
        })),
      });

      const bobotAspek = aspekBobotMap.get(detail.aspek_id);
      if (bobotAspek === undefined) {
        throw new Error(`Aspek dengan ID ${detail.aspek_id} tidak ditemukan.`);
      }
      // Akumulasi total nilai keseluruhan
      total_nilai_keseluruhan += (nilai_aspek_terbobot * bobotAspek) / 100;
    }

    // 4. Membuat record utama di tabel Penilaians
    const penilaianHeader = await Penilaian.create(
      {
        penilaian_id: await generatePenilaianId(event_id, team_id),
        event_id,
        team_id,
        juri_id: juriId,
        total_nilai: total_nilai_keseluruhan.toFixed(2),
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
      }
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
