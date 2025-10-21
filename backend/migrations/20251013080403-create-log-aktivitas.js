'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('log_aktivitas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      log_target: {
        type: Sequelize.STRING
      },
      log_action: {
        type: Sequelize.STRING
      },
      log_detail: {
        type: Sequelize.TEXT
      },
      log_source: {
        type: Sequelize.TEXT
      },
      log_record: {
        type: Sequelize.DATE
      },
      log_owner: {
        type: Sequelize.STRING
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('log_aktivitas');
  }
};