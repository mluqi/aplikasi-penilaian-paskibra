const { roles, menus, role_access, sequelize } = require("../models");
const { logAktivitas } = require("../services/logService");

/**
 * Mengambil semua peran, menu, dan matriks akses saat ini.
 */
exports.getAccessMatrix = async (req, res) => {
  try {
    const allRoles = await roles.findAll({ order: [["role_name", "ASC"]] });
    const allMenus = await menus.findAll({ order: [["menu_name", "ASC"]] });
    const allAccess = await role_access.findAll();

    // Ubah daftar akses yang flat menjadi objek matriks untuk kemudahan di frontend
    const access = {};
    allAccess.forEach((item) => {
      if (!access[item.role_id]) {
        access[item.role_id] = [];
      }
      access[item.role_id].push(item.menu_id);
    });

    res.status(200).json({
      roles: allRoles,
      menus: allMenus,
      access,
    });
  } catch (error) {
    console.error("Error fetching access matrix:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Memperbarui seluruh matriks hak akses.
 * Ini akan menghapus semua data lama dan memasukkan yang baru.
 */
exports.updateAccessMatrix = async (req, res) => {
  const { access } = req.body; // Menerima objek matriks akses dari frontend
  const t = await sequelize.transaction();

  try {
    // 1. Hapus semua entri yang ada di role_access
    await role_access.destroy({ where: {}, truncate: true, transaction: t });

    // 2. Buat data baru untuk bulk insert
    const newRoleAccessData = [];
    let idCounter = 1;
    for (const roleId in access) {
      const menuIds = access[roleId];
      for (const menuId of menuIds) {
        newRoleAccessData.push({
          role_access_id: `RA${String(idCounter++).padStart(4, "0")}`,
          role_id: roleId,
          menu_id: menuId,
        });
      }
    }

    // 3. Masukkan data baru jika ada
    if (newRoleAccessData.length > 0) {
      await role_access.bulkCreate(newRoleAccessData, { transaction: t });
    }

    // 4. Commit transaksi
    await t.commit();

    // Log aktivitas (opsional tapi direkomendasikan)
    logAktivitas({
      target: "Role Access Matrix",
      action: "UPDATE",
      detail: "SUCCESS - Hak akses berhasil diperbarui.",
      owner: req.user.id,
    });

    res.status(200).json({ message: "Hak akses berhasil diperbarui." });
  } catch (error) {
    await t.rollback();
    console.error("Error updating access matrix:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};
