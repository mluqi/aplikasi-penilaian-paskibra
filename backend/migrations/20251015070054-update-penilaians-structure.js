"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1️⃣ Hapus kolom yang tidak diperlukan lagi
    await queryInterface.removeColumn("Penilaians", "aspek_id");
    await queryInterface.removeColumn("Penilaians", "nilai");
    await queryInterface.removeColumn("Penilaians", "kelompok");

    // 2️⃣ Tambahkan kolom baru untuk total nilai dan komentar
    await queryInterface.addColumn("Penilaians", "total_nilai", {
      type: Sequelize.DECIMAL(6, 2),
      allowNull: false,
      defaultValue: 0.0,
    });

    await queryInterface.addColumn("Penilaians", "catatan", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert perubahan di atas
    await queryInterface.removeColumn("Penilaians", "total_nilai");
    await queryInterface.removeColumn("Penilaians", "catatan");
    await queryInterface.removeColumn("Penilaians", "createdAt");
    await queryInterface.removeColumn("Penilaians", "updatedAt");

    // Tambahkan kembali kolom lama (jika rollback)
    await queryInterface.addColumn("Penilaians", "aspek", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Penilaians", "nilai", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Penilaians", "kelompok", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
