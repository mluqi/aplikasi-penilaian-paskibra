require("dotenv").config({ path: "../.env" });
const axios = require("axios");

// Base URL yang benar (versi /v1/wilayah)
const url = "https://api.palindo.id/v1/wilayah";

const headers = {
  "x-palindo-api-key": process.env.PALINDO_API_KEY,
};

const getProvinsi = async () => {
  try {
    const response = await axios.get(`${url}/provinsi`, { headers });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching provinces:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const getKota = async (province_id) => {
  try {
    // Perbaikan: Menggunakan query parameter yang benar
    const response = await axios.get(`${url}/kota?province_id=${province_id}`, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching cities:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Jalankan hanya jika file ini dieksekusi langsung
if (require.main === module) {
  (async () => {
    await getProvinsi();
    await getKota(11); // Contoh ID provinsi
  })();
}

module.exports = { getProvinsi, getKota };
