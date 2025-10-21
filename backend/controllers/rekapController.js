const {
  Teams,
  Events,
  Aspeks,
  RekapNilai,
  AspekNilais,
  Penilaian,
  SubAspekNilais,
  SubAspeks,
  Users,
  Event_teams,
  sequelize,
  Op,
} = require("../models");

exports.getRekapByEvent = async (req, res) => {
  const { role: userRole, id: userId } = req.user;
  const { event_id } = req.params;

  if (!event_id) {
    return res.status(400).json({ message: "Event ID is required." });
  }

  try {
    // Jika user adalah juri atau koordinator tim, kembalikan daftar tim dan detail penilaian
    if (userRole === "juri" || userRole === "koordinator_team") {
      const eventTeams = await Event_teams.findAll({
        where: { event_id },
        include: [
          {
            model: Teams,
            attributes: [
              "team_id",
              "team_name",
              "team_sekolah_instansi",
              "team_logo",
            ],
            // Jika koordinator tim, filter berdasarkan tim yang mereka handle
            where:
              userRole === "koordinator_team" ? { koordinator_id: userId } : {},
            include: [
              {
                model: RekapNilai,
                where: { event_id },
                required: false, // Gunakan LEFT JOIN agar tim yang belum dinilai tetap muncul
              },
            ],
          },
        ],
        order: [[Teams, "team_name", "ASC"]],
      });

      const teams = eventTeams.map((et) => et.Team).filter(Boolean); // filter(Boolean) untuk menghapus null jika ada

      return res.status(200).json({
        isSpecialView: true,
        teams: teams,
      });
    }

    // --- Logika untuk Admin, Superadmin, dan Koordinator Event ---

    // 1. Ambil daftar aspek untuk header tabel
    const masterAspeks = await Aspeks.findAll({
      where: { event_id },
      attributes: ["aspek_id", "nama_aspek"],
      order: [["urutan", "ASC"]],
    });
    const aspekHeaders = masterAspeks.map((a) => a.nama_aspek);
    const aspekIdToNameMap = new Map(
      masterAspeks.map((a) => [a.aspek_id, a.nama_aspek])
    );

    // 2. Ambil data rekapitulasi utama dan detail penilaian secara paralel
    const [rekapList, allPenilaian, avgAspectScores] = await Promise.all([
      // Data utama untuk peringkat
      RekapNilai.findAll({
        where: { event_id },
        include: [
          { model: Teams, attributes: ["team_name", "team_sekolah_instansi"] },
        ],
        order: [["nilai_akhir", "DESC"]],
      }),
      // Data detail untuk dialog pop-up
      Penilaian.findAll({
        where: { event_id },
        include: [
          {
            model: Users,
            as: "User",
            attributes: ["user_id", "user_name", "user_photo"],
          },
          { model: Teams, attributes: ["team_id", "team_name"] },
          {
            model: AspekNilais,
            include: [
              { model: Aspeks, attributes: ["nama_aspek"] },
              {
                model: SubAspekNilais,
                include: [{ model: SubAspeks, attributes: ["nama_subaspek"] }],
              },
            ],
          },
        ],
      }),
      // Data rata-rata skor per aspek
      AspekNilais.findAll({
        attributes: [
          [sequelize.col("Penilaian.team_id"), "team_id"],
          "aspek_id",
          [
            sequelize.fn("AVG", sequelize.col("AspekNilais.nilai_aspek")),
            "avg_score",
          ],
        ],
        include: [
          {
            model: Penilaian,
            attributes: [],
            where: { event_id },
            required: true,
          },
        ],
        group: ["Penilaian.team_id", "AspekNilais.aspek_id"],
        raw: true,
      }),
    ]);

    if (rekapList.length === 0) {
      return res.status(200).json({
        isSpecialView: false,
        rekap: [],
        aspeks: aspekHeaders,
        details: {},
      });
    }

    // 3. Kelompokkan data detail dan skor aspek berdasarkan team_id
    const detailsByTeam = {};
    allPenilaian.forEach((p) => {
      if (!detailsByTeam[p.team_id]) detailsByTeam[p.team_id] = [];
      detailsByTeam[p.team_id].push(p);
    });

    const scoresByTeam = new Map();
    avgAspectScores.forEach((score) => {
      if (!scoresByTeam.has(score.team_id)) scoresByTeam.set(score.team_id, {});
      const aspekName = aspekIdToNameMap.get(score.aspek_id);
      if (aspekName)
        scoresByTeam.get(score.team_id)[aspekName] = parseFloat(
          score.avg_score
        );
    });

    // 4. Format data akhir untuk dikirim ke frontend
    const finalRekap = rekapList.map((item, index) => ({
      team_id: item.team_id,
      team_name: item.Team.team_name,
      team_sekolah_instansi: item.Team.team_sekolah_instansi,
      total: parseFloat(item.nilai_akhir),
      scores: scoresByTeam.get(item.team_id) || {},
      rank: index + 1,
    }));

    res.status(200).json({
      isSpecialView: false,
      rekap: finalRekap,
      aspeks: aspekHeaders,
      details: detailsByTeam, // Sertakan data detail di sini
    });
  } catch (error) {
    console.error("Error fetching rekap:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getPublicRekapByEvent = async (req, res) => {
  const { event_id } = req.params;

  if (!event_id) {
    return res.status(400).json({ message: "Event ID is required." });
  }

  try {
    const event = await Events.findOne({
      where: { event_id },
      attributes: ["event_id", "event_name", "event_status"],
    });

    if (!event) {
      return res
        .status(404)
        .json({ message: "Event tidak ditemukan atau hasil belum tersedia." });
    }

    // 1. Ambil semua aspek untuk header tabel
    const masterAspeks = await Aspeks.findAll({
      where: { event_id },
      attributes: ["aspek_id", "nama_aspek"],
      order: [["urutan", "ASC"]],
    });
    const aspekHeaders = masterAspeks.map((a) => a.nama_aspek);
    const aspekIdToNameMap = new Map(
      masterAspeks.map((a) => [a.aspek_id, a.nama_aspek])
    );

    // 2. Ambil nilai akhir dan rata-rata nilai per aspek untuk semua tim
    const [rekapList, avgAspectScores] = await Promise.all([
      RekapNilai.findAll({
        where: { event_id },
        include: [
          {
            model: Teams,
            attributes: ["team_name", "team_sekolah_instansi", "team_logo"],
          },
        ],
        order: [["nilai_akhir", "DESC"]],
      }),
      AspekNilais.findAll({
        attributes: [
          [sequelize.col("Penilaian.team_id"), "team_id"],
          "aspek_id",
          [
            sequelize.fn("AVG", sequelize.col("AspekNilais.nilai_aspek")),
            "avg_score",
          ],
        ],
        include: [
          {
            model: Penilaian,
            attributes: [],
            where: { event_id },
            required: true,
          },
        ],
        group: ["Penilaian.team_id", "AspekNilais.aspek_id"],
        raw: true,
      }),
    ]);

    // 3. Proses dan gabungkan data
    const scoresByTeam = new Map();
    avgAspectScores.forEach((score) => {
      if (!scoresByTeam.has(score.team_id)) {
        scoresByTeam.set(score.team_id, {});
      }
      const aspekName = aspekIdToNameMap.get(score.aspek_id);
      if (aspekName) {
        scoresByTeam.get(score.team_id)[aspekName] = parseFloat(
          score.avg_score
        );
      }
    });

    const finalRekap = rekapList.map((item, index) => ({
      rank: index + 1,
      ...item.toJSON(),
      scores: scoresByTeam.get(item.team_id) || {},
    }));

    res.status(200).json({ event, rekap: finalRekap, aspeks: aspekHeaders });
  } catch (error) {
    console.error("Error fetching public rekap:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
