"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Nama constraint 'Event_teams_ibfk_2' diambil dari pesan error.
    // Nama ini bisa berbeda tergantung pada setup database Anda,
    // namun biasanya mengikuti pola ini.
    const constraintName = "Event_teams_ibfk_2";

    try {
      // 1. Hapus foreign key constraint yang salah
      await queryInterface.removeConstraint("Event_teams", constraintName);

      // 2. Tambahkan foreign key constraint yang benar
      await queryInterface.addConstraint("Event_teams", {
        fields: ["team_id"],
        type: "foreign key",
        name: "Event_teams_team_id_fkey", // Nama constraint baru yang lebih deskriptif
        references: {
          table: "Teams",
          field: "team_id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    } catch (error) {
      console.error(`Gagal menghapus constraint lama: ${error.message}`);
      console.log(`Mencoba untuk hanya menambahkan constraint baru...`);
      // Jika penghapusan gagal (misalnya constraint tidak ada), coba tambahkan saja
      await queryInterface.addConstraint("Event_teams", {
        fields: ["team_id"],
        type: "foreign key",
        name: "Event_teams_team_id_fkey",
        references: {
          table: "Teams",
          field: "team_id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // 1. Hapus constraint yang benar
    await queryInterface.removeConstraint(
      "Event_teams",
      "Event_teams_team_id_fkey"
    );

    // 2. (Opsional) Tambahkan kembali constraint yang salah untuk rollback
    await queryInterface.addConstraint("Event_teams", {
      fields: ["team_id"],
      type: "foreign key",
      name: "Event_teams_ibfk_2", // Nama constraint lama
      references: {
        table: "Users", // Tabel yang salah
        field: "user_id", // Kolom yang salah
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },
};
