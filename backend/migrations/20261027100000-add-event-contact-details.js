"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Events", "event_batas_pendaftaran", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn("Events", "event_contact_person_name", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Events", "event_contact_person_number", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Events", "event_penyelenggara", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Events", "event_batas_pendaftaran");
    await queryInterface.removeColumn("Events", "event_contact_person_name");
    await queryInterface.removeColumn("Events", "event_contact_person_number");
    await queryInterface.removeColumn("Events", "event_penyelenggara");
  },
};
