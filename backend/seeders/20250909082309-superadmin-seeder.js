'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Menambahkan data superadmin.
     */
    const hashedPassword = await bcrypt.hash('admin345', 10); // Ganti 'password123' dengan password yang aman

    await queryInterface.bulkInsert(
      'Users',
      [
        {
          user_id: 'ADM0001',
          user_name: 'Super Admin',
          user_email: 'superadmin@example.com',
          user_password: hashedPassword,
          user_role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', { user_email: 'superadmin@example.com' }, {});
  },
};

