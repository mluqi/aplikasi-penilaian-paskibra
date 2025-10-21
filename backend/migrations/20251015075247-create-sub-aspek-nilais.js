"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("SubAspekNilais", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      aspeknilai_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "AspekNilais",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      subaspek_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "SubAspeks",
          key: "subaspek_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      nilai: {
        type: Sequelize.DECIMAL,
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
    await queryInterface.dropTable("SubAspekNilais");
  },
};
