const { log_akses, log_aktivitas } = require("../models");

/**
 * Mencatat aktivitas login pengguna.
 * Dijalankan secara 'fire-and-forget' agar tidak menghambat proses utama.
 * @param {object} data
 * @param {string} data.id - ID atau email pengguna yang mencoba login.
 * @param {string} data.ip - Alamat IP dari mana permintaan berasal.
 * @param {string} data.browser - Browser yang digunakan.
 * @param {'Berhasil' | 'Gagal'} data.status - Status upaya login.
 */
exports.logAkses = async ({ id, ip, browser, status }) => {
  try {
    await log_akses.create({
      // Gunakan ID jika ada, jika tidak (misal: user tidak ditemukan), gunakan email.
      akses_user: id,
      akses_ip: ip,
      akses_browser: browser,
      akses_status: status,
      akses_record: new Date(),
    });
  } catch (error) {
    // Log error ke konsol tanpa menghentikan alur utama
    console.error("Gagal mencatat log akses:", error);
  }
};

/**
 * Mencatat aktivitas CRUD atau aksi penting lainnya yang dilakukan oleh pengguna.
 * Dijalankan secara 'fire-and-forget'.
 * @param {object} data
 * @param {string} data.target - ID dari entitas yang dituju.
 * @param {string} data.action - Aksi yang dilakukan (misal: 'CREATE', 'UPDATE', 'DELETE').
 * @param {string | object} data.detail - Detail dari aksi, misal: 'SUCCESS' atau 'FAILED: [alasan]'.
 * @param {string} [data.query] - Template query SQL yang dieksekusi.
 * @param {Array} [data.data] - Data yang diikat ke query.
 * @param {string} data.owner - ID pengguna yang melakukan aksi.
 */
exports.logAktivitas = async ({
  target,
  action,
  detail,
  query,
  data,
  owner,
}) => {
  try {
    // Jika detail adalah objek, ubah menjadi string JSON
    const log_detail =
      typeof detail === "object" ? JSON.stringify(detail) : detail;

    // Encode query ke Base64
    let fullQuery = query || "";
    if (query && data) {
      fullQuery += ` -- DATA: ${JSON.stringify(data)}`;
    }
    const log_source = fullQuery
      ? Buffer.from(fullQuery).toString("base64")
      : null;

    await log_aktivitas.create({
      log_target: target,
      log_action: action,
      log_detail,
      log_source,
      log_owner: owner,
      log_record: new Date(),
    });
  } catch (error) {
    // Log error ke konsol tanpa menghentikan alur utama
    console.error("Gagal mencatat log aktivitas:", error);
  }
};
