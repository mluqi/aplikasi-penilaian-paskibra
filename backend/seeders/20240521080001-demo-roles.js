"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "roles",
      [
        {
          role_id: "superadmin",
          role_name: "Super Administrator",
          role_description: "Memiliki akses penuh ke semua fitur aplikasi.",
        },
        {
          role_id: "admin",
          role_name: "Administrator",
          role_description: "Dapat mengelola pengguna, tim, dan event.",
        },
        {
          role_id: "juri",
          role_name: "Juri",
          role_description:
            "Dapat memberikan penilaian pada event yang diikuti.",
        },
        {
          role_id: "koordinator_team",
          role_name: "Koordinator Tim",
          role_description: "Dapat mengelola tim dan anggota timnya.",
        },
        {
          role_id: "koordinator_event",
          role_name: "Koordinator Event",
          role_description: "Dapat mengelola event dan pesertanya.",
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("roles", null, {});
  },
};
