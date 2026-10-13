'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const tableInfo = await queryInterface.describeTable('Kategori_juaras');
      if (!tableInfo.jenis_juara) {
        await queryInterface.addColumn('Kategori_juaras', 'jenis_juara', {
          type: Sequelize.ENUM('juara_umum', 'juara_peringkat', 'juara_kategori'),
          defaultValue: 'juara_kategori',
          allowNull: true,
        });

        // Populate initial values based on existing columns
        await queryInterface.sequelize.query(`
          UPDATE Kategori_juaras
          SET jenis_juara = 'juara_umum'
          WHERE is_juara_umum = 1;
        `);

        await queryInterface.sequelize.query(`
          UPDATE Kategori_juaras
          SET jenis_juara = 'juara_peringkat'
          WHERE (is_juara_umum = 0 OR is_juara_umum IS NULL)
            AND (tipe_penilaian = 'global' OR LOWER(nama_kategori) LIKE '%peringkat%' OR LOWER(nama_kategori) LIKE '%klasemen%');
        `);

        await queryInterface.sequelize.query(`
          UPDATE Kategori_juaras
          SET jenis_juara = 'juara_kategori'
          WHERE jenis_juara IS NULL;
        `);
      }
    } catch (error) {
      console.error('Error adding jenis_juara column:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const tableInfo = await queryInterface.describeTable('Kategori_juaras');
      if (tableInfo.jenis_juara) {
        await queryInterface.removeColumn('Kategori_juaras', 'jenis_juara');
      }
    } catch (error) {
      console.error('Error removing jenis_juara column:', error);
      throw error;
    }
  }
};
