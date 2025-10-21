"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Teams", {
      team_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      team_name: {
        type: Sequelize.STRING,
      },
      team_sekolah_instansi: {
        type: Sequelize.STRING,
      },
      team_jumlah_anggota: {
        type: Sequelize.INTEGER,
      },
      team_logo: {
        type: Sequelize.TEXT,
      },
      koordinator_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "Users",
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
    await queryInterface.dropTable("Teams");
  },
};
