"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Definisikan semua menu yang ada
    const allMenus = [
      "view_dashboard",
      "manage_users",
      "manage_pending_users",
      "manage_teams",
      "manage_events",
      "view_recap",
      "input_assessment",
      "view_activity_log",
      "view_access_log",
      "manage_role_access",
    ];

    // Definisikan hak akses untuk setiap peran
    const accessMatrix = {
      superadmin: allMenus,
      admin: [
        "view_dashboard",
        "manage_users",
        "manage_pending_users",
        "manage_teams",
        "manage_events",
        "view_recap",
        "view_activity_log",
        "view_access_log",
        "manage_role_access",
      ],
      juri: ["view_dashboard", "input_assessment"],
      koordinator_team: ["view_dashboard", "manage_teams", "view_recap"],
      koordinator_event: ["view_dashboard", "manage_events", "view_recap"],
    };

    // Buat data untuk bulk insert
    const roleAccessData = [];
    let idCounter = 1;

    for (const roleId in accessMatrix) {
      const menus = accessMatrix[roleId];
      for (const menuId of menus) {
        roleAccessData.push({
          role_access_id: `RA${String(idCounter++).padStart(4, "0")}`,
          role_id: roleId,
          menu_id: menuId,
        });
      }
    }

    await queryInterface.bulkInsert("role_access", roleAccessData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("role_access", null, {});
  },
};
