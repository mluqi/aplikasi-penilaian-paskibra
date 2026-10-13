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
    await queryInterface.addColumn("Events", "xenplatform_id", {
      type: Sequelize.STRING,
      allowNull: true,
      after: "donasi_selesai",
    });
    await queryInterface.addColumn("Events", "xenplatform_data", {
      type: Sequelize.TEXT,
      allowNull: true,
      after: "xenplatform_id",
    });
    await queryInterface.addColumn("Events", "qris_data", {
      type: Sequelize.TEXT,
      allowNull: true,
      after: "xenplatform_data",
    });
    await queryInterface.addColumn("Events", "balance", {
      type: Sequelize.BIGINT,
      defaultValue: 0,
      after: "qris_data",
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("Events", "xenplatform_id");
    await queryInterface.removeColumn("Events", "xenplatform_data");
    await queryInterface.removeColumn("Events", "qris_data");
    await queryInterface.removeColumn("Events", "balance");
  },
};
