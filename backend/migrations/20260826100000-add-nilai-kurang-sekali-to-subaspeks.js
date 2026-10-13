'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('SubAspeks', 'nilai_kurang_sekali', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'kategori',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('SubAspeks', 'nilai_kurang_sekali');
  }
};
