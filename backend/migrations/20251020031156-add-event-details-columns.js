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
    await queryInterface.addColumn("Events", "event_kategori", {
      type: Sequelize.ENUM("smp", "sma_smk", "mahasiswa", "umum"),
      allowNull: true,
      after: "event_name",
    });
    await queryInterface.addColumn("Events", "event_tingkat", {
      type: Sequelize.ENUM("kota_kabupaten", "provinsi", "nasional"),
      allowNull: true,
      after: "event_kategori",
    });
    await queryInterface.addColumn("Events", "event_provinsi", {
      type: Sequelize.STRING,
      allowNull: true,
      after: "event_tingkat",
    });
    await queryInterface.addColumn("Events", "event_kota", {
      type: Sequelize.STRING,
      allowNull: true,
      after: "event_provinsi",
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("Events", "event_kategori");
    await queryInterface.removeColumn("Events", "event_tingkat");
    await queryInterface.removeColumn("Events", "event_provinsi");
    await queryInterface.removeColumn("Events", "event_kota");
  },
};
