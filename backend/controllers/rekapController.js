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
  Team_penalties,
  Event_penalties,
  Kategori_juara,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

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
      masterAspeks.map((a) => [a.aspek_id, a.nama_aspek]),
    );

    // 2. Ambil data rekapitulasi utama dan detail penilaian secara paralel beserta nomor tampil
    const [
      rekapList,
      allPenilaian,
      avgAspectScores,
      eventTeamsInfo,
      teamPenaltiesList,
    ] = await Promise.all([
      // Data utama daftar tim
      RekapNilai.findAll({
        where: { event_id },
        include: [
          {
            model: Teams,
            attributes: ["team_name", "team_sekolah_instansi"],
          },
        ],
      }),
      // Data detail lengkap dari seluruh juri (dikembalikan agar data.details utuh)
      Penilaian.findAll({
        where: { event_id },
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
      // Data total penjumlahan skor per aspek
      AspekNilais.findAll({
        attributes: [
          [sequelize.col("Penilaian.team_id"), "team_id"],
          "aspek_id",
          [
            sequelize.fn("SUM", sequelize.col("AspekNilais.nilai_aspek")),
            "total_score",
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
      // Data Nomor Tampil
      Event_teams.findAll({
        where: { event_id },
        attributes: ["team_id", "nomor_tampil"],
      }),
      // Data Penalti
      Team_penalties.findAll({
        where: { event_id },
        include: [
          {
            model: Event_penalties,
            as: "event_penalty",
            attributes: ["nama_pelanggaran", "poin_potongan"],
          },
        ],
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
        scoresByTeam.get(score.team_id)[aspekName] = parseInt(
          score.total_score,
          10,
        );
    });

    const nomorTampilMap = new Map(
      eventTeamsInfo.map((et) => [et.team_id, et.nomor_tampil]),
    );

    const penaltiesByTeam = {};
    if (teamPenaltiesList) {
      teamPenaltiesList.forEach((p) => {
        if (!penaltiesByTeam[p.team_id]) penaltiesByTeam[p.team_id] = [];
        penaltiesByTeam[p.team_id].push(p);
      });
    }

    // 4. Format data akhir tanpa peringkat dan tanpa total
    let finalRekap = rekapList.map((item) => {
      const teamPenalties = penaltiesByTeam[item.team_id] || [];
      const total_pengurangan = teamPenalties.reduce(
        (sum, p) => sum + Math.abs(p.total_pengurangan || 0),
        0,
      );
      return {
        team_id: item.team_id,
        team_name: item.Team.team_name,
        team_sekolah_instansi: item.Team.team_sekolah_instansi,
        nomor_tampil: nomorTampilMap.get(item.team_id),
        scores: scoresByTeam.get(item.team_id) || {},
        penalty: {
          total_pengurangan,
          details: teamPenalties,
        },
      };
    });

    // Urutkan berdasarkan Nomor Tampil
    finalRekap.sort((a, b) => {
      const numA = Number(a.nomor_tampil) || Number.MAX_SAFE_INTEGER;
      const numB = Number(b.nomor_tampil) || Number.MAX_SAFE_INTEGER;
      if (numA === numB) {
        return a.team_name.localeCompare(b.team_name); // Jika sama, urutkan nama alfabetis
      }
      return numA - numB;
    });

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

exports.getKategoriJuaraByEvent = async (req, res) => {
  try {
    const { event_id } = req.params;
    const kategori = await Kategori_juara.findAll({
      where: { event_id },
      order: [["urutan", "ASC"]],
    });
    const formattedData = kategori.map((k) => {
      let parsedAspekId = [];
      if (
        (k.tipe_penilaian === "aspek" || k.tipe_penilaian === "lainnya") &&
        k.aspek_id
      ) {
        try {
          parsedAspekId = JSON.parse(k.aspek_id);
        } catch (e) {
          parsedAspekId = [k.aspek_id];
        }
      }
      return {
        ...k.toJSON(),
        aspek_id: parsedAspekId,
      };
    });
    res.status(200).json({ data: formattedData });
  } catch (error) {
    console.error("Error fetching kategori juara:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createKategoriJuara = async (req, res) => {
  try {
    const {
      event_id,
      nama_kategori,
      tipe_penilaian,
      aspek_id,
      urutan,
      kurangi_penalty,
      is_juara_umum,
      jenis_juara,
      limit_juara,
    } = req.body;
    if (!event_id || !nama_kategori || !tipe_penilaian) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }
    const computedJenisJuara =
      jenis_juara ||
      (is_juara_umum
        ? "juara_umum"
        : tipe_penilaian === "global"
          ? "juara_peringkat"
          : "juara_kategori");
    const computedIsJuaraUmum =
      computedJenisJuara === "juara_umum" || is_juara_umum === true;

    const newKategori = await Kategori_juara.create({
      event_id,
      nama_kategori,
      tipe_penilaian,
      urutan: urutan || 0,
      aspek_id:
        tipe_penilaian === "aspek" || tipe_penilaian === "lainnya"
          ? JSON.stringify(aspek_id)
          : null,
      kurangi_penalty: kurangi_penalty || false,
      is_juara_umum: computedIsJuaraUmum,
      jenis_juara: computedJenisJuara,
      limit_juara:
        limit_juara !== undefined
          ? limit_juara === null || limit_juara === ""
            ? null
            : parseInt(limit_juara, 10)
          : null,
    });
    res
      .status(201)
      .json({ message: "Kategori berhasil dibuat", data: newKategori });
  } catch (error) {
    console.error("Error creating kategori juara:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateKategoriJuara = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nama_kategori,
      tipe_penilaian,
      aspek_id,
      urutan,
      kurangi_penalty,
      is_juara_umum,
      jenis_juara,
      limit_juara,
    } = req.body;
    const kategori = await Kategori_juara.findByPk(id);
    if (!kategori)
      return res.status(404).json({ message: "Kategori tidak ditemukan" });

    const computedJenisJuara =
      jenis_juara !== undefined
        ? jenis_juara
        : kategori.jenis_juara ||
          (kategori.is_juara_umum
            ? "juara_umum"
            : kategori.tipe_penilaian === "global"
              ? "juara_peringkat"
              : "juara_kategori");
    const computedIsJuaraUmum =
      computedJenisJuara === "juara_umum" ||
      (is_juara_umum !== undefined ? is_juara_umum : kategori.is_juara_umum);

    await kategori.update({
      nama_kategori,
      tipe_penilaian,
      urutan: urutan || 0,
      aspek_id:
        tipe_penilaian === "aspek" || tipe_penilaian === "lainnya"
          ? JSON.stringify(aspek_id)
          : null,
      kurangi_penalty:
        kurangi_penalty !== undefined
          ? kurangi_penalty
          : kategori.kurangi_penalty,
      is_juara_umum: computedIsJuaraUmum,
      jenis_juara: computedJenisJuara,
      limit_juara:
        limit_juara !== undefined
          ? limit_juara === null || limit_juara === ""
            ? null
            : parseInt(limit_juara, 10)
          : kategori.limit_juara,
    });
    res
      .status(200)
      .json({ message: "Kategori berhasil diperbarui", data: kategori });
  } catch (error) {
    console.error("Error updating kategori juara:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteKategoriJuara = async (req, res) => {
  try {
    const { id } = req.params;
    const kategori = await Kategori_juara.findByPk(id);
    if (!kategori)
      return res.status(404).json({ message: "Kategori tidak ditemukan" });

    await kategori.destroy();
    res.status(200).json({ message: "Kategori berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting kategori juara:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getKlasemenKategori = async (req, res) => {
  try {
    const { kategori_id } = req.params;
    const kategori = await Kategori_juara.findByPk(kategori_id);
    if (!kategori)
      return res.status(404).json({ message: "Kategori tidak ditemukan" });

    let klasemen = [];

    // 1. Ambil seluruh data pendukung untuk Tie-Breaker sekaligus
    const [masterAspeks, rekapList, avgAspectScores, teamPenaltiesList] =
      await Promise.all([
        Aspeks.findAll({
          where: { event_id: kategori.event_id },
          order: [["urutan", "ASC"]],
        }),
        RekapNilai.findAll({
          where: { event_id: kategori.event_id },
          include: [
            {
              model: Teams,
              attributes: [
                "team_id",
                "team_name",
                "team_sekolah_instansi",
                "team_logo",
              ],
            },
          ],
        }),
        AspekNilais.findAll({
          attributes: [
            [sequelize.col("Penilaian.team_id"), "team_id"],
            "aspek_id",
            [
              sequelize.fn("SUM", sequelize.col("AspekNilais.nilai_aspek")),
              "total_score",
            ],
          ],
          include: [
            {
              model: Penilaian,
              attributes: [],
              where: { event_id: kategori.event_id },
              required: true,
            },
          ],
          group: ["Penilaian.team_id", "AspekNilais.aspek_id"],
          raw: true,
        }),
        Team_penalties.findAll({ where: { event_id: kategori.event_id } }),
      ]);

    const aspekHeaders = masterAspeks.map((a) => a.nama_aspek);
    const aspekIdToNameMap = new Map(
      masterAspeks.map((a) => [a.aspek_id, a.nama_aspek]),
    );

    const globalTotals = new Map();
    rekapList.forEach((r) =>
      globalTotals.set(r.team_id, parseFloat(r.nilai_akhir || 0)),
    );

    const scoresByTeam = new Map();
    avgAspectScores.forEach((score) => {
      if (!scoresByTeam.has(score.team_id)) scoresByTeam.set(score.team_id, {});
      const aspekName = aspekIdToNameMap.get(score.aspek_id);
      if (aspekName) {
        scoresByTeam.get(score.team_id)[aspekName] = parseFloat(
          score.total_score || 0,
        );
      }
    });

    const penaltiesByTeam = new Map(); // { team_id => { total: number, details: [] } }
    teamPenaltiesList.forEach((p) => {
      if (!penaltiesByTeam.has(p.team_id)) {
        penaltiesByTeam.set(p.team_id, { total: 0, details: [] });
      }
      const current = penaltiesByTeam.get(p.team_id);
      current.total += Math.abs(p.total_pengurangan || 0);
      current.details.push({
        nama_pelanggaran: p.Event_penalty?.nama_pelanggaran || "Pelanggaran",
        jumlah: p.jumlah,
        total_pengurangan: p.total_pengurangan,
      });
    });

    // 2. Fungsi Tie-Breaker untuk Kategori
    const tieBreakerSort = (a, b) => {
      // Rule 1: Bandingkan Total Nilai pada Kategori Ini (Nilai Utama yang diperebutkan)
      if (b.nilai_akhir !== a.nilai_akhir) return b.nilai_akhir - a.nilai_akhir;

      // Rule 2: Bandingkan Total Aspek berdasarkan prioritas urutan (Prioritas Aspek)
      const sA = scoresByTeam.get(a.team_id) || {};
      const sB = scoresByTeam.get(b.team_id) || {};
      for (const aspekName of aspekHeaders) {
        const scoreA = sA[aspekName] || 0;
        const scoreB = sB[aspekName] || 0;
        if (scoreB !== scoreA) return scoreB - scoreA;
      }

      // Rule 3: Bandingkan Total Keseluruhan Event (Global)
      const totalA = globalTotals.get(a.team_id) || 0;
      const totalB = globalTotals.get(b.team_id) || 0;
      if (totalB !== totalA) return totalB - totalA;

      // Rule 4: Bandingkan Penalti (Lebih kecil menang)
      const penA = penaltiesByTeam.get(a.team_id)?.total || 0;
      const penB = penaltiesByTeam.get(b.team_id)?.total || 0;
      if (penA !== penB) return penA - penB;

      return 0; // Seri mutlak
    };

    // 3. Proses berdasarkan tipe kategori
    let categoryAspeks = [];

    if (kategori.tipe_penilaian === "global") {
      categoryAspeks = aspekHeaders;
      klasemen = rekapList.map((r) => ({
        team_id: r.Team?.team_id || r.team_id,
        team_name: r.Team?.team_name || "Tim Tidak Dikenal",
        team_sekolah_instansi: r.Team?.team_sekolah_instansi || null,
        team_logo: r.Team?.team_logo || null,
        nilai_akhir: parseFloat(r.nilai_akhir || 0),
        scores: scoresByTeam.get(r.team_id) || {},
        penalty: {
          total_pengurangan: penaltiesByTeam.get(r.team_id)?.total || 0,
          details: penaltiesByTeam.get(r.team_id)?.details || [],
        },
      }));
    } else if (kategori.tipe_penilaian === "aspek") {
      let parsedAspekIds = [];
      if (kategori.aspek_id) {
        try {
          parsedAspekIds = JSON.parse(kategori.aspek_id);
        } catch (e) {
          parsedAspekIds = [kategori.aspek_id];
        }
      }

      const targetAspeks = await Aspeks.findAll({
        where: { aspek_id: { [Op.in]: parsedAspekIds } },
        order: [["urutan", "ASC"]],
      });
      categoryAspeks = targetAspeks.map((a) => a.nama_aspek);

      const allNilaiAspek = await AspekNilais.findAll({
        where: { aspek_id: { [Op.in]: parsedAspekIds } },
        include: [
          {
            model: Penilaian,
            where: { event_id: kategori.event_id },
            include: [
              {
                model: Teams,
                attributes: [
                  "team_id",
                  "team_name",
                  "team_sekolah_instansi",
                  "team_logo",
                ],
              },
            ],
          },
          {
            model: Aspeks,
            attributes: ["nama_aspek"],
          },
        ],
      });

      const teamScores = {};
      allNilaiAspek.forEach((item) => {
        const team = item.Penilaian.Team;
        if (!teamScores[team.team_id]) {
          teamScores[team.team_id] = {
            team_id: team.team_id,
            team_name: team.team_name,
            team_sekolah_instansi: team.team_sekolah_instansi,
            team_logo: team.team_logo,
            nilai_akhir: 0,
            scores: {},
            penalty: {
              total_pengurangan: penaltiesByTeam.get(team.team_id)?.total || 0,
              details: penaltiesByTeam.get(team.team_id)?.details || [],
            },
          };
        }

        const aspekName = item.Aspek?.nama_aspek;
        if (aspekName) {
          if (!teamScores[team.team_id].scores[aspekName]) {
            teamScores[team.team_id].scores[aspekName] = 0;
          }
          teamScores[team.team_id].scores[aspekName] += parseFloat(
            item.nilai_aspek || 0,
          );
        }

        teamScores[team.team_id].nilai_akhir += parseFloat(
          item.nilai_aspek || 0,
        );
      });

      if (kategori.kurangi_penalty) {
        Object.values(teamScores).forEach((t) => {
          t.nilai_akhir -= penaltiesByTeam.get(t.team_id)?.total || 0;
        });
      }

      klasemen = Object.values(teamScores);
    } else if (kategori.tipe_penilaian === "lainnya") {
      let manualData = [];
      if (kategori.aspek_id) {
        try {
          manualData = JSON.parse(kategori.aspek_id);
        } catch (e) {}
      }

      const teamIds = manualData.map((d) => d.team_id);
      const teamsInfo = await Teams.findAll({ where: { team_id: teamIds } });
      const teamMap = new Map(teamsInfo.map((t) => [t.team_id, t]));

      klasemen = manualData.map((d) => {
        const t = teamMap.get(d.team_id);
        let nilaiAkhir = parseFloat(d.nilai_akhir) || 0;
        if (kategori.kurangi_penalty) {
          nilaiAkhir -= penaltiesByTeam.get(d.team_id)?.total || 0;
        }
        return {
          team_id: d.team_id,
          team_name: t ? t.team_name : "Tim Tidak Dikenal",
          team_sekolah_instansi: t ? t.team_sekolah_instansi : null,
          team_logo: t ? t.team_logo : null,
          nilai_akhir: nilaiAkhir,
          penalty: {
            total_pengurangan: penaltiesByTeam.get(d.team_id)?.total || 0,
            details: penaltiesByTeam.get(d.team_id)?.details || [],
          },
        };
      });
    }

    // 4. Terapkan Tie-Breaker Paskibra untuk semua tipe klasemen
    klasemen.sort(tieBreakerSort);

    // Tetapkan atribut Rank
    const finalKlasemen = klasemen.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    const showAll = req.query.all === "true";
    const totalPeserta = finalKlasemen.length;
    const limitJuara =
      kategori.limit_juara !== null && kategori.limit_juara !== undefined
        ? parseInt(kategori.limit_juara, 10)
        : null;

    res.status(200).json({
      kategori: kategori.nama_kategori,
      tipe_penilaian: kategori.tipe_penilaian,
      kurangi_penalty: kategori.kurangi_penalty,
      is_juara_umum:
        kategori.is_juara_umum || kategori.jenis_juara === "juara_umum",
      jenis_juara:
        kategori.jenis_juara ||
        (kategori.is_juara_umum
          ? "juara_umum"
          : kategori.tipe_penilaian === "global"
            ? "juara_peringkat"
            : "juara_kategori"),
      limit_juara: limitJuara,
      total_peserta: totalPeserta,
      klasemen: finalKlasemen,
      aspeks: categoryAspeks,
    });
  } catch (error) {
    console.error("Error fetching klasemen kategori:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getPublicRekapByEvent = async (req, res) => {
  const { event_id } = req.params;
  const { type } = req.query;

  if (!event_id) {
    return res.status(400).json({ message: "Event ID is required." });
  }

  try {
    const event = await Events.findOne({
      where: { event_id },
      attributes: ["event_id", "event_name", "event_status", "is_result_show"],
    });

    if (!event) {
      return res
        .status(404)
        .json({ message: "Event tidak ditemukan atau hasil belum tersedia." });
    }

    // Jalur Cepat (Bypass) khusus untuk E-Voting agar tidak menghitung ulang seluruh nilai aspek
    if (type === "evoting") {
      const donationList = await Event_teams.findAll({
        where: { event_id },
        include: [
          {
            model: Teams,
            attributes: ["team_id", "team_name", "team_sekolah_instansi", "team_logo"],
          },
        ],
        order: [["balance", "DESC"]],
      });
      return res.status(200).json({
        event,
        donasi: donationList,
      });
    }

    // 1. Ambil semua aspek untuk header tabel
    const masterAspeks = await Aspeks.findAll({
      where: { event_id },
      attributes: ["aspek_id", "nama_aspek"],
      order: [["urutan", "ASC"]],
    });
    const aspekHeaders = masterAspeks.map((a) => a.nama_aspek);
    const aspekIdToNameMap = new Map(
      masterAspeks.map((a) => [a.aspek_id, a.nama_aspek]),
    );

    // 2. Ambil nilai rata-rata per aspek untuk semua tim
    const [rekapList, avgAspectScores, donationList, teamPenaltiesList] =
      await Promise.all([
        RekapNilai.findAll({
          where: { event_id },
          include: [
            {
              model: Teams,
              attributes: ["team_name", "team_sekolah_instansi", "team_logo"],
            },
          ],
        }),
        AspekNilais.findAll({
          attributes: [
            [sequelize.col("Penilaian.team_id"), "team_id"],
            "aspek_id",
            [
              sequelize.fn("SUM", sequelize.col("AspekNilais.nilai_aspek")),
              "total_score",
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
        // Mengambil daftar donasi dari balance Event_teams
        Event_teams.findAll({
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
            },
          ],
          order: [["balance", "DESC"]],
        }),
        // Data Penalti Publik
        Team_penalties.findAll({
          where: { event_id },
          include: [
            {
              model: Event_penalties,
              as: "event_penalty",
              attributes: ["nama_pelanggaran", "poin_potongan"],
            },
          ],
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
        scoresByTeam.get(score.team_id)[aspekName] = parseInt(
          score.total_score,
          10,
        );
      }
    });

    const penaltiesByTeam = {};
    if (teamPenaltiesList) {
      teamPenaltiesList.forEach((p) => {
        if (!penaltiesByTeam[p.team_id]) penaltiesByTeam[p.team_id] = [];
        penaltiesByTeam[p.team_id].push(p);
      });
    }

    let finalRekap = rekapList.map((item) => {
      const teamPenalties = penaltiesByTeam[item.team_id] || [];
      const total_pengurangan = teamPenalties.reduce(
        (sum, p) => sum + Math.abs(p.total_pengurangan || 0),
        0,
      );
      return {
        ...item.toJSON(),
        scores: scoresByTeam.get(item.team_id) || {},
        penalty: { total_pengurangan, details: teamPenalties },
      };
    });

    // Mengurutkan berdasarkan nama tim secara alfabetis
    finalRekap.sort((a, b) => {
      const nameA = a.Team?.team_name || "";
      const nameB = b.Team?.team_name || "";
      return nameA.localeCompare(nameB);
    });

    res.status(200).json({
      event,
      rekap: finalRekap,
      aspeks: aspekHeaders,
      donasi: donationList, // Kirim klasemen donasi
    });
  } catch (error) {
    console.error("Error fetching public rekap:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
