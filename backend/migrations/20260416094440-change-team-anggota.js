"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn("Teams", "foto_all_team", {
      type: Sequelize.TEXT,
      allowNull: true,
      after: "team_logo",
    });
    await queryInterface.removeColumn("Anggota_teams", "anggota_is_danton");
    await queryInterface.addColumn("Anggota_teams", "anggota_tipe", {
      type: Sequelize.ENUM(
        "pelatih",
        "danton",
        "anggota pasukan",
        "anggota cadangan",
      ),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("Teams", "foto_all_team");
    await queryInterface.addColumn("Anggota_teams", "anggota_is_danton", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      after: "anggota_tipe",
    });
    await queryInterface.removeColumn("Anggota_teams", "anggota_tipe");
  },
};
