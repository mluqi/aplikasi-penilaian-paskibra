const { getProvinsi, getKota } = require("../services/wilayahApi");

/**
 * Mengambil semua data provinsi dari API eksternal.
 */
exports.getAllProvinsi = async (req, res) => {
  try {
    const provinsi = await getProvinsi();
    res.status(200).json(provinsi);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengambil data provinsi.", error: error.message });
  }
};

/**
 * Mengambil data kota berdasarkan ID provinsi dari API eksternal.
 */
exports.getAllKotaByProvinsi = async (req, res) => {
  try {
    const { province_id } = req.query;
    if (!province_id) {
      return res.status(400).json({ message: "province_id diperlukan." });
    }
    const kota = await getKota(province_id);
    res.status(200).json(kota);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengambil data kota.", error: error.message });
  }
};
