"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 2. Buat tabel pivot baru: Event_juri_aspeks
      await queryInterface.createTable(
        "Event_juri_aspeks",
        {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
          },
          event_juri_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: "Event_juris",
              key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },
          aspek_id: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
              model: "Aspeks",
              key: "aspek_id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE,
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE,
          },
        },
        { transaction },
      );

      // Tambahkan unique constraint untuk mencegah duplikasi
      await queryInterface.addConstraint("Event_juri_aspeks", {
        fields: ["event_juri_id", "aspek_id"],
        type: "unique",
        name: "unique_event_juri_aspek",
        transaction,
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Hapus tabel pivot
      await queryInterface.dropTable("Event_juri_aspeks", { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
