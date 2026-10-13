"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Update ENUM user_role di tabel Users
      await queryInterface.changeColumn(
        "Users",
        "user_role",
        {
          type: Sequelize.ENUM(
            "superadmin",
            "admin",
            "juri",
            "koordinator_team",
            "koordinator_event",
            "asisten_juri",
          ),
          allowNull: true,
        },
        { transaction },
      );

      // 2. Tambah kolom asisten_id di tabel Penilaians
      await queryInterface.addColumn(
        "Penilaians",
        "asisten_id",
        {
          type: Sequelize.STRING,
          allowNull: true,
          references: {
            model: "Users",
            key: "user_id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL", // Jika user asisten dihapus, riwayat asisten_id jadi NULL (tidak menghapus nilai)
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
    // Catatan: Revert ENUM di beberapa database SQL bisa rumit,
    // namun kita bisa melakukan rollback untuk kolom asisten_id.
    await queryInterface.removeColumn("Penilaians", "asisten_id");
  },
};
