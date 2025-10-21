'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Anggota_teams', {
      anggota_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      anggota_nama: {
        type: Sequelize.STRING
      },
      anggota_tempat_lahir: {
        type: Sequelize.STRING
      },
      anggota_tanggal_lahir: {
        type: Sequelize.DATE
      },
      anggota_is_danton: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      team_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'Teams',
          key: 'team_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Anggota_teams');
  }
};