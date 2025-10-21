"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("SubAspeks", {
      subaspek_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      aspek_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "Aspeks",
          key: "aspek_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      nama_subaspek: {
        type: Sequelize.STRING,
      },
      bobot: {
        type: Sequelize.DECIMAL,
      },
      urutan: {
        type: Sequelize.INTEGER,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("SubAspeks");
  },
};
