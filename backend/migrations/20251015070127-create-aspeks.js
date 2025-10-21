"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Aspeks", {
      aspek_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      event_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "Events",
          key: "event_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      nama_aspek: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      bobot: {
        type: Sequelize.DECIMAL(5, 2),
      },
      urutan: {
        type: Sequelize.INTEGER,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Aspeks");
  },
};
