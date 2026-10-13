'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      const tableInfo = await queryInterface.describeTable('Events');
      if (!tableInfo.kategori_options) {
        await queryInterface.addColumn('Events', 'kategori_options', {
          type: Sequelize.TEXT,
          allowNull: true,
        });
      }
    } catch (e) {
      console.warn('Migration warning:', e.message);
    }
  },

  async down (queryInterface, Sequelize) {
    try {
      const tableInfo = await queryInterface.describeTable('Events');
      if (tableInfo.kategori_options) {
        await queryInterface.removeColumn('Events', 'kategori_options');
      }
    } catch (e) {
      console.warn('Migration warning:', e.message);
    }
  }
};
