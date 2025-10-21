'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('roles', {
      role_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      role_name: {
        type: Sequelize.STRING
      },
      role_description: {
        type: Sequelize.STRING
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('roles');
  }
};