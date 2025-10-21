"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "menus",
      [
        {
          menu_id: "view_dashboard",
          menu_name: "Dashboard",
          menu_path: "/admin/dashboard",
          menu_description: "Halaman utama setelah login.",
        },
        {
          menu_id: "manage_users",
          menu_name: "Manajemen Pengguna",
          menu_path: "/admin/users",
          menu_description: "Mengelola data semua pengguna aktif.",
        },
        {
          menu_id: "manage_pending_users",
          menu_name: "Persetujuan Pengguna",
          menu_path: "/admin/pending-users",
          menu_description:
            "Menyetujui atau menolak pendaftaran pengguna baru.",
        },
        {
          menu_id: "manage_teams",
          menu_name: "Manajemen Tim",
          menu_path: "/admin/teams",
          menu_description: "Mengelola data tim paskibra.",
        },
        {
          menu_id: "manage_events",
          menu_name: "Manajemen Event",
          menu_path: "/admin/events",
          menu_description: "Mengelola data event lomba.",
        },
        {
          menu_id: "view_recap",
          menu_name: "Rekap Nilai",
          menu_path: "/admin/rekap",
          menu_description: "Melihat rekapitulasi nilai dari berbagai event.",
        },
        {
          menu_id: "input_assessment",
          menu_name: "Input Penilaian",
          menu_path: "/admin/penilaian",
          menu_description: "Halaman untuk juri menginputkan nilai.",
        },
        {
          menu_id: "view_activity_log",
          menu_name: "Log Aktivitas",
          menu_path: "/admin/log-aktivitas",
          menu_description: "Melihat log aktivitas pengguna.",
        },
        {
          menu_id: "view_access_log",
          menu_name: "Log Akses",
          menu_path: "/admin/log-akses",
          menu_description: "Melihat log akses (login/logout) pengguna.",
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("menus", null, {});
  },
};
