"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Events", {
      event_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      event_name: {
        type: Sequelize.STRING,
      },
      event_tanggal: {
        type: Sequelize.DATE,
      },
      event_tempat: {
        type: Sequelize.STRING,
      },
      event_waktu: {
        type: Sequelize.TIME,
      },
      event_poster: {
        type: Sequelize.TEXT,
      },
      event_biaya_pendaftaran: {
        type: Sequelize.BIGINT,
      },
      event_deskripsi: {
        type: Sequelize.TEXT,
      },
      event_status: {
        type: Sequelize.ENUM("draft", "published", "archived"),
        defaultValue: "draft",
      },
      koordinator_id: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Events");
  },
};
