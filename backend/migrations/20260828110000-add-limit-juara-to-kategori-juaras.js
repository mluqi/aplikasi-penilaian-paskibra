'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      const tableInfo = await queryInterface.describeTable('Kategori_juaras');
      if (!tableInfo.limit_juara) {
        await queryInterface.addColumn('Kategori_juaras', 'limit_juara', {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 3,
        });
      }
    } catch (e) {
      console.warn('Migration warning:', e.message);
    }
  },

  async down (queryInterface, Sequelize) {
    try {
      const tableInfo = await queryInterface.describeTable('Kategori_juaras');
      if (tableInfo.limit_juara) {
        await queryInterface.removeColumn('Kategori_juaras', 'limit_juara');
      }
    } catch (e) {
      console.warn('Migration warning:', e.message);
    }
  }
};
