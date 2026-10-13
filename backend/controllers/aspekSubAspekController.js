const {
  Aspeks,
  SubAspeks,
  AspekNilais,
  SubAspekNilais,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");
const { logAktivitas } = require("../services/logService");
const xlsx = require("xlsx");

const generateAspekId = async (event_id) => {
  const lastAspek = await Aspeks.findOne({
    where: { event_id },
    order: [["aspek_id", "DESC"]],
  });
  if (!lastAspek) {
    return `ASP001-${event_id}`;
  } else {
    // Ekstrak nomor dari bagian pertama ID, misal dari "ASP005-EVT001" ambil "005"
    const lastIdNum = parseInt(lastAspek.aspek_id.substring(3, 6), 10);
    const newIdNum = lastIdNum + 1;
    return `ASP${newIdNum.toString().padStart(3, "0")}-${event_id}`;
  }
};

const generateSubAspekId = async (aspekId, event_id) => {
  const lastSubAspek = await SubAspeks.findOne({
    where: { aspek_id: aspekId },
    order: [["subaspek_id", "DESC"]],
  });

  if (!lastSubAspek) {
    return `SUB-${aspekId}-001`;
  }

  // Ekstrak nomor dari bagian terakhir ID, misal dari "SUB-ASP001-EVT001-005" ambil "005"
  const lastNum = parseInt(lastSubAspek.subaspek_id.split("-").pop(), 10);
  const newIdNum = lastNum + 1;
  return `SUB-${aspekId}-${newIdNum.toString().padStart(3, "0")}`;
};

// Fungsi untuk mendapatkan semua aspek beserta sub-aspek dan nilai-nilai terkait
exports.getAllAspekSubAspek = async (req, res) => {
  try {
    const aspekSubAspekData = await Aspeks.findAll({
      include: [
        {
          model: SubAspeks,
          include: [
            {
              model: SubAspekNilais,
            },
          ],
        },
        {
          model: AspekNilais,
          include: [
            {
              model: SubAspekNilais,
            },
          ],
        },
      ],
    });
    res.status(200).json(aspekSubAspekData);
  } catch (error) {
    console.error("Error fetching aspek and sub-aspek data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Export Aspek & Sub-Aspek ke format Excel
exports.exportAspekExcel = async (req, res) => {
  try {
    const { event_id } = req.params;
    const aspeks = await Aspeks.findAll({
      where: { event_id },
      include: [{ model: SubAspeks }],
      order: [
        ["urutan", "ASC"],
        [SubAspeks, "urutan", "ASC"],
      ],
    });

    const data = [];

    aspeks.forEach((aspek) => {
      if (aspek.SubAspeks && aspek.SubAspeks.length > 0) {
        aspek.SubAspeks.forEach((sub) => {
          data.push({
            Aspek: aspek.nama_aspek,
            "Urutan Aspek": aspek.urutan || "",
            Kategori: sub.kategori || "",
            "Sub Aspek": sub.nama_subaspek,
            "Nilai Kurang Sekali": sub.nilai_kurang_sekali,
            "Nilai Kurang": sub.nilai_kurang,
            "Nilai Cukup": sub.nilai_cukup,
            "Nilai Baik": sub.nilai_baik,
            "Nilai Sangat Baik": sub.nilai_sangat_baik,
            "Urutan Sub Aspek": sub.urutan || "",
          });
        });
      } else {
        data.push({
          Aspek: aspek.nama_aspek,
          "Urutan Aspek": aspek.urutan || "",
        });
      }
    });

    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Format Penilaian");

    const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="format_penilaian_${event_id}.xlsx"`,
    );
    res.status(200).send(buffer);
  } catch (error) {
    console.error("Error exporting Excel:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Import Aspek & Sub-Aspek dari format Excel
exports.importAspekExcel = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { event_id } = req.params;
    const { excel_data } = req.body;

    if (!excel_data) {
      await t.rollback();
      return res.status(400).json({ message: "Data Excel tidak ditemukan." });
    }

    const buffer = Buffer.from(excel_data, "base64");
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(worksheet);

    if (!rows || rows.length === 0) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "File Excel kosong atau format tidak valid." });
    }

    const aspekMap = new Map();
    rows.forEach((row) => {
      const nama_aspek = row["Aspek"];
      const urutan_aspek = row["Urutan Aspek"];
      const kategori = row["Kategori"];
      const nama_subaspek = row["Sub Aspek"];
      const nilai_kurang_sekali = row["Nilai Kurang Sekali"] || row["Nilai KS"];
      const nilai_kurang = row["Nilai Kurang"];
      const nilai_cukup = row["Nilai Cukup"];
      const nilai_baik = row["Nilai Baik"];
      const nilai_sangat_baik = row["Nilai Sangat Baik"];
      const urutan_subaspek = row["Urutan Sub Aspek"];

      if (!nama_aspek) return;

      if (!aspekMap.has(nama_aspek)) {
        aspekMap.set(nama_aspek, {
          nama_aspek: String(nama_aspek),
          urutan: parseInt(urutan_aspek) || 1,
          sub_aspeks: [],
        });
      }

      if (nama_subaspek) {
        aspekMap.get(nama_aspek).sub_aspeks.push({
          nama_subaspek: String(nama_subaspek),
          kategori: kategori ? String(kategori) : null,
          nilai_kurang_sekali:
            nilai_kurang_sekali !== undefined
              ? String(nilai_kurang_sekali).replace(/\s+/g, "")
              : "",
          nilai_kurang:
            nilai_kurang !== undefined
              ? String(nilai_kurang).replace(/\s+/g, "")
              : "",
          nilai_cukup:
            nilai_cukup !== undefined
              ? String(nilai_cukup).replace(/\s+/g, "")
              : "",
          nilai_baik:
            nilai_baik !== undefined
              ? String(nilai_baik).replace(/\s+/g, "")
              : "",
          nilai_sangat_baik:
            nilai_sangat_baik !== undefined
              ? String(nilai_sangat_baik).replace(/\s+/g, "")
              : "",
          urutan: parseInt(urutan_subaspek) || 1,
        });
      }
    });

    const lastAspek = await Aspeks.findOne({
      where: { event_id },
      order: [["aspek_id", "DESC"]],
      transaction: t,
    });

    let lastAspekNum =
      lastAspek && lastAspek.aspek_id
        ? parseInt(lastAspek.aspek_id.substring(3, 6), 10)
        : 0;

    for (const [_, aspekData] of aspekMap) {
      lastAspekNum++;
      const aspek_id = `ASP${lastAspekNum.toString().padStart(3, "0")}-${event_id}`;

      await Aspeks.create(
        {
          aspek_id,
          event_id,
          nama_aspek: aspekData.nama_aspek,
          urutan: aspekData.urutan,
        },
        { transaction: t },
      );

      let lastSubAspekNum = 0;
      for (const sub of aspekData.sub_aspeks) {
        lastSubAspekNum++;
        const subaspek_id = `SUB-${aspek_id}-${lastSubAspekNum.toString().padStart(3, "0")}`;

        await SubAspeks.create(
          {
            subaspek_id,
            aspek_id,
            nama_subaspek: sub.nama_subaspek,
            kategori: sub.kategori,
            nilai_kurang_sekali: sub.nilai_kurang_sekali,
            nilai_kurang: sub.nilai_kurang,
            nilai_cukup: sub.nilai_cukup,
            nilai_baik: sub.nilai_baik,
            nilai_sangat_baik: sub.nilai_sangat_baik,
            urutan: sub.urutan,
          },
          { transaction: t },
        );
      }
    }

    await t.commit();
    res.status(200).json({ message: "Format penilaian berhasil diimport." });
  } catch (error) {
    await t.rollback();
    console.error("Error importing CSV:", error);
    res.status(500).json({ message: "Terjadi kesalahan saat import data." });
  }
};

// Fungsi untuk mendapatkan aspek dan sub-aspek berdasarkan penilaian_id
exports.getAspekSubAspekByPenilaianId = async (req, res) => {
  const { penilaian_id } = req.params;
  try {
    const aspekSubAspekData = await Aspeks.findAll({
      include: [
        {
          model: SubAspeks,
          include: [
            {
              model: SubAspekNilais,
              where: { penilaian_id },
              required: false, // Agar tetap menampilkan sub-aspek meskipun tidak ada nilai
            },
          ],
        },
        {
          model: AspekNilais,
          where: { penilaian_id },
          required: false, // Agar tetap menampilkan aspek meskipun tidak ada nilai
          include: [
            {
              model: SubAspekNilais,
              where: { penilaian_id },
              required: false, // Agar tetap menampilkan sub-aspek meskipun tidak ada nilai
            },
          ],
        },
      ],
    });
    res.status(200).json(aspekSubAspekData);
  } catch (error) {
    console.error(
      "Error fetching aspek and sub-aspek data by penilaian_id:",
      error,
    );
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createAspek = async (req, res) => {
  try {
    const { event_id, nama_aspek, urutan } = req.body;
    if (!event_id)
      return res.status(400).json({ message: "event_id diperlukan." });

    const aspek_id = await generateAspekId(event_id);
    const createData = {
      aspek_id,
      event_id,
      nama_aspek,
      urutan,
    };
    const newAspek = await Aspeks.create(createData);

    logAktivitas({
      target: newAspek.aspek_id,
      action: "CREATE",
      detail: `Aspek '${nama_aspek}' untuk Event ID: ${event_id}`,
      owner: req.user.id,
    });

    res.status(201).json(newAspek);
  } catch (error) {
    console.error("Error creating aspek:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan server saat membuat aspek." });
  }
};

exports.getAllAspeks = async (req, res) => {
  try {
    const { event_id } = req.query;
    const aspeks = await Aspeks.findAll({
      where: event_id ? { event_id } : {},
      include: [{ model: SubAspeks }],
    });

    res.status(200).json(aspeks);
  } catch (error) {
    console.error("Error fetching aspeks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAspeksById = async (req, res) => {
  try {
    const { aspek_id } = req.params;
    const aspek = await Aspeks.findByPk(aspek_id);
    if (!aspek) {
      return res.status(404).json({ message: "Aspek tidak ditemukan." });
    }
    res.status(200).json(aspek);
  } catch (error) {
    console.error("Error fetching aspek:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan server saat mengambil aspek." });
  }
};

exports.updateAspek = async (req, res) => {
  try {
    const { aspek_id } = req.params;
    const { nama_aspek, urutan } = req.body;
    const aspek = await Aspeks.findByPk(aspek_id);

    if (!aspek) {
      return res.status(404).json({ message: "Aspek tidak ditemukan." });
    }
    const updateData = {
      nama_aspek: nama_aspek ?? aspek.nama_aspek,
      urutan: urutan ?? aspek.urutan,
    };
    await aspek.update(updateData);

    logAktivitas({
      target: aspek_id,
      action: "UPDATE",
      detail: `Aspek diperbarui`,
      data: updateData,
      owner: req.user.id,
    });

    await aspek.save();
    res.status(200).json(aspek);
  } catch (error) {
    console.error("Error updating aspek:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

exports.deleteAspek = async (req, res) => {
  try {
    const { aspek_id } = req.params;

    const aspek = await Aspeks.findByPk(aspek_id);
    if (!aspek) {
      return res.status(404).json({ message: "Aspek tidak ditemukan." });
    }

    const aspekName = aspek.nama_aspek;
    await aspek.destroy();

    logAktivitas({
      target: aspek_id,
      action: "DELETE",
      detail: `Aspek '${aspekName}' dihapus.`,
      owner: req.user.id,
    });

    res.status(200).json({ message: "Aspek berhasil dihapus." });
  } catch (error) {
    console.error("Error deleting aspek:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createSubAspek = async (req, res) => {
  try {
    const {
      aspek_id,
      nama_subaspek,
      kategori,
      nilai_kurang_sekali,
      nilai_kurang,
      nilai_cukup,
      nilai_baik,
      nilai_sangat_baik,
      urutan,
      event_id,
    } = req.body;

    const subaspek_id = await generateSubAspekId(aspek_id, event_id);
    const createData = {
      subaspek_id,
      aspek_id,
      nama_subaspek,
      kategori,
      nilai_kurang_sekali,
      nilai_kurang,
      nilai_cukup,
      nilai_baik,
      nilai_sangat_baik,
      urutan,
    };
    const newSubAspek = await SubAspeks.create(createData);

    logAktivitas({
      target: newSubAspek.subaspek_id,
      action: "CREATE",
      detail: `Sub-Aspek '${nama_subaspek}' untuk Aspek ID: ${aspek_id}`,
      owner: req.user.id,
    });

    res.status(201).json(newSubAspek);
  } catch (error) {
    console.error("Error creating sub-aspek:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

exports.getAllSubAspeks = async (req, res) => {
  try {
    const { subaspek_id } = req.params;
    const subaspek = await SubAspeks.findByPk(subaspek_id);
    if (!subaspek) {
      return res.status(404).json({ message: "subaspek not found" });
    }
    res.status(200).json(subaspek);
  } catch (error) {
    console.error("Error fetching sub-aspek:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getSubAspeksByAspekId = async (req, res) => {
  try {
    const { aspek_id } = req.params;
    const subaspeks = await SubAspeks.findAll({ where: { aspek_id } });
    res.status(200).json(subaspeks);
  } catch (error) {
    console.error("Error fetching sub-aspek by aspek_id:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateSubAspek = async (req, res) => {
  try {
    const { subaspek_id } = req.params;
    const {
      nama_subaspek,
      kategori,
      nilai_kurang_sekali,
      nilai_kurang,
      nilai_cukup,
      nilai_baik,
      nilai_sangat_baik,
      urutan,
    } = req.body;
    const subaspek = await SubAspeks.findByPk(subaspek_id);

    if (!subaspek) {
      return res.status(404).json({ message: "Sub-Aspek tidak ditemukan." });
    }
    const updateData = {
      nama_subaspek: nama_subaspek ?? subaspek.nama_subaspek,
      kategori: kategori !== undefined ? kategori : subaspek.kategori,
      nilai_kurang_sekali: nilai_kurang_sekali ?? subaspek.nilai_kurang_sekali,
      nilai_kurang: nilai_kurang ?? subaspek.nilai_kurang,
      nilai_cukup: nilai_cukup ?? subaspek.nilai_cukup,
      nilai_baik: nilai_baik ?? subaspek.nilai_baik,
      nilai_sangat_baik: nilai_sangat_baik ?? subaspek.nilai_sangat_baik,
      urutan: urutan ?? subaspek.urutan,
    };
    await subaspek.update(updateData);
    await subaspek.save();

    logAktivitas({
      target: subaspek_id,
      action: "UPDATE",
      detail: `Sub-Aspek diperbarui`,
      data: updateData,
      owner: req.user.id,
    });

    res.status(200).json(subaspek);
  } catch (error) {
    console.error("Error updating SubAspek:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteSubAspek = async (req, res) => {
  try {
    const { subaspek_id } = req.params;

    const subaspek = await SubAspeks.findByPk(subaspek_id);
    if (!subaspek) {
      return res.status(404).json({ message: "Sub-Aspek tidak ditemukan." });
    }

    const subAspekName = subaspek.nama_subaspek;
    await subaspek.destroy();

    logAktivitas({
      target: subaspek_id,
      action: "DELETE",
      detail: `Sub-Aspek '${subAspekName}' dihapus.`,
      owner: req.user.id,
    });
    res.status(200).json({ message: "Sub-Aspek berhasil dihapus." });
  } catch (error) {
    console.error("Error deleting SubAspek:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
