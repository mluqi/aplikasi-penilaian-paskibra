"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("AspekNilais", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      penilaian_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "Penilaians",
          key: "penilaian_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
      nilai_aspek: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: null,
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
    await queryInterface.dropTable("AspekNilais");
  },
};
