"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Update Tabel Aspeks (Hapus kolom bobot)
      await queryInterface.removeColumn("Aspeks", "bobot", { transaction });

      // 2. Update Tabel SubAspeks
      await queryInterface.removeColumn("SubAspeks", "bobot", { transaction });

      await queryInterface.addColumn(
        "SubAspeks",
        "nilai_kurang",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        "SubAspeks",
        "nilai_cukup",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        "SubAspeks",
        "nilai_baik",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        "SubAspeks",
        "nilai_sangat_baik",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        { transaction },
      );

      // 3. Update Tabel AspekNilais (Ubah tipe data menjadi INTEGER)
      await queryInterface.changeColumn(
        "AspekNilais",
        "nilai_aspek",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        { transaction },
      );

      // 4. Update Tabel SubAspekNilais (Ubah tipe data menjadi INTEGER)
      await queryInterface.changeColumn(
        "SubAspekNilais",
        "nilai",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        { transaction },
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Revert Tabel Aspeks
      await queryInterface.addColumn(
        "Aspeks",
        "bobot",
        {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: true,
          defaultValue: 0,
        },
        { transaction },
      );

      // 2. Revert Tabel SubAspeks
      await queryInterface.removeColumn("SubAspeks", "nilai_kurang", {
        transaction,
      });
      await queryInterface.removeColumn("SubAspeks", "nilai_cukup", {
        transaction,
      });
      await queryInterface.removeColumn("SubAspeks", "nilai_baik", {
        transaction,
      });
      await queryInterface.removeColumn("SubAspeks", "nilai_sangat_baik", {
        transaction,
      });
      await queryInterface.addColumn(
        "SubAspeks",
        "bobot",
        {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: true,
        },
        { transaction },
      );

      // Note: Mengembalikan changeColumn dari INTEGER kembali ke DECIMAL bisa berisiko hilangnya data
      // jika ada data INTEGER yang tidak kompatibel. Dalam skenario ini kita abaikan revert untuk changeColumn
      // nilai_aspek dan nilai, atau bisa ditambahkan jika databasenya sepenuhnya mendukung konversi balik yang mulus.

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
