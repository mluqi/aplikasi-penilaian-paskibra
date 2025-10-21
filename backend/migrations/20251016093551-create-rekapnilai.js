"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("rekapnilai", {
      rekapnilai_id: {
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
      team_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "Teams",
          key: "team_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      nilai_akhir: {
        type: Sequelize.DECIMAL,
      },
      jumlah_juri: {
        type: Sequelize.INTEGER,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("rekapnilai");
  },
};
