"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("menus", {
      menu_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      menu_name: {
        type: Sequelize.STRING,
      },
      menu_path: {
        type: Sequelize.STRING,
      },
      menu_description: {
        type: Sequelize.STRING,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("menus");
  },
};
