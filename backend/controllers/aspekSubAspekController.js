const { Aspeks, SubAspeks, AspekNilais, SubAspekNilais } = require("../models");
const { Op } = require("sequelize");
const { logAktivitas } = require("../services/logService");

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
      error
    );
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createAspek = async (req, res) => {
  try {
    const { event_id, nama_aspek, bobot, urutan } = req.body;
    if (!event_id)
      return res.status(400).json({ message: "event_id diperlukan." });

    // Validasi total bobot aspek
    const existingAspeks = await Aspeks.findAll({ where: { event_id } });
    const currentTotalBobot = existingAspeks.reduce(
      (sum, aspek) => sum + parseFloat(aspek.bobot),
      0
    );
    if (currentTotalBobot + parseFloat(bobot) > 100) {
      return res.status(400).json({
        message: `Total bobot aspek akan melebihi 100. Sisa bobot yang tersedia: ${
          100 - currentTotalBobot
        }%.`,
      });
    }

    const aspek_id = await generateAspekId(event_id);
    const createData = {
      aspek_id,
      event_id,
      nama_aspek,
      bobot,
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
    const { nama_aspek, bobot, urutan } = req.body;
    const aspek = await Aspeks.findByPk(aspek_id);

    if (bobot && aspek) {
      // Validasi total bobot aspek saat update
      const otherAspeks = await Aspeks.findAll({
        where: { event_id: aspek.event_id, aspek_id: { [Op.ne]: aspek_id } },
      });
      const otherTotalBobot = otherAspeks.reduce(
        (sum, a) => sum + parseFloat(a.bobot),
        0
      );
      if (otherTotalBobot + parseFloat(bobot) > 100) {
        return res.status(400).json({
          message: `Total bobot aspek akan melebihi 100. Sisa bobot yang tersedia (tanpa aspek ini): ${
            100 - otherTotalBobot
          }%.`,
        });
      }
    }

    if (!aspek) {
      return res.status(404).json({ message: "Aspek tidak ditemukan." });
    }
    const updateData = {
      nama_aspek: nama_aspek ?? aspek.nama_aspek,
      bobot: bobot ?? aspek.bobot,
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
    const { aspek_id, nama_subaspek, bobot, urutan, event_id } = req.body;

    // Validasi total bobot sub-aspek
    const existingSubAspeks = await SubAspeks.findAll({ where: { aspek_id } });
    const currentTotalBobot = existingSubAspeks.reduce(
      (sum, sub) => sum + parseFloat(sub.bobot),
      0
    );
    if (currentTotalBobot + parseFloat(bobot) > 100) {
      return res.status(400).json({
        message: `Total bobot sub-aspek akan melebihi 100. Sisa bobot yang tersedia: ${
          100 - currentTotalBobot
        }%.`,
      });
    }

    const subaspek_id = await generateSubAspekId(aspek_id, event_id);
    const createData = {
      subaspek_id,
      aspek_id,
      nama_subaspek,
      bobot,
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
    const { nama_subaspek, bobot, urutan } = req.body;
    const subaspek = await SubAspeks.findByPk(subaspek_id);

    if (bobot && subaspek) {
      // Validasi total bobot sub-aspek saat update
      const otherSubAspeks = await SubAspeks.findAll({
        where: {
          aspek_id: subaspek.aspek_id,
          subaspek_id: { [Op.ne]: subaspek_id },
        },
      });
      const otherTotalBobot = otherSubAspeks.reduce(
        (sum, s) => sum + parseFloat(s.bobot),
        0
      );
      if (otherTotalBobot + parseFloat(bobot) > 100) {
        return res.status(400).json({
          message: `Total bobot sub-aspek akan melebihi 100. Sisa bobot yang tersedia (tanpa sub-aspek ini): ${
            100 - otherTotalBobot
          }%.`,
        });
      }
    }
    if (!subaspek) {
      return res.status(404).json({ message: "Sub-Aspek tidak ditemukan." });
    }
    const updateData = {
      nama_subaspek: nama_subaspek ?? subaspek.nama_subaspek,
      bobot: bobot ?? subaspek.bobot,
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
