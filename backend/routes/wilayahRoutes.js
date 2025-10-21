const express = require("express");
const router = express.Router();
const {
  getAllProvinsi,
  getAllKotaByProvinsi,
} = require("../controllers/wilayahController");

// Endpoint publik untuk mendapatkan daftar provinsi
router.get("/provinsi", getAllProvinsi);

// Endpoint publik untuk mendapatkan daftar kota berdasarkan ID provinsi
router.get("/kota", getAllKotaByProvinsi);

module.exports = router;
