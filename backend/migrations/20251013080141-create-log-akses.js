"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("log_akses", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      akses_user: {
        type: Sequelize.STRING,
      },
      akses_ip: {
        type: Sequelize.STRING,
      },
      akses_status: {
        type: Sequelize.STRING,
      },
      akses_record: {
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("log_akses");
  },
};
