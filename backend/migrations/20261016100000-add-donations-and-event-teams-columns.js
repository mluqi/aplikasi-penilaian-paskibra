"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Tambahkan kolom baru pada tabel Event_teams
    await queryInterface.addColumn("Event_teams", "xenplatform_id", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Event_teams", "qris_data", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("Event_teams", "balance", {
      type: Sequelize.BIGINT,
      allowNull: true,
      defaultValue: 0,
    });

    // 2. Buat tabel Donations baru
    await queryInterface.createTable("Donations", {
      donation_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
      },
      event_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "Events",
          key: "event_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      team_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "Teams",
          key: "team_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      amount: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
      donor_name: {
        type: Sequelize.STRING,
      },
      payment_status: {
        type: Sequelize.STRING,
      },
      xendit_transaction_id: {
        type: Sequelize.STRING,
      },
      payment_method: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    // 1. Hapus tabel Donations
    await queryInterface.dropTable("Donations");

    // 2. Hapus kolom yang ditambahkan pada tabel Event_teams
    await queryInterface.removeColumn("Event_teams", "xenplatform_id");
    await queryInterface.removeColumn("Event_teams", "qris_data");
    await queryInterface.removeColumn("Event_teams", "balance");
  },
};
