"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Events extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Events.belongsTo(models.Users, { foreignKey: "koordinator_id" });
      Events.hasMany(models.Event_juri, { foreignKey: "event_id" });
      Events.hasMany(models.Event_asisten, { foreignKey: "event_id" });
      Events.hasMany(models.Event_teams, { foreignKey: "event_id" });
      Events.hasMany(models.Penilaian, { foreignKey: "event_id" });
      Events.hasMany(models.Aspeks, { foreignKey: "event_id" });
      Events.hasMany(models.RekapNilai, { foreignKey: "event_id" });
      Events.hasMany(models.Donations, { foreignKey: "event_id" });
    }
  }
  Events.init(
    {
      event_id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      event_name: DataTypes.STRING,
      event_kategori: DataTypes.ENUM("sd", "smp", "sma_smk", "umum"),
      event_tingkat: DataTypes.ENUM("kota_kabupaten", "provinsi", "nasional"),
      event_provinsi: DataTypes.STRING,
      event_kota: DataTypes.STRING,
      event_tanggal: DataTypes.DATE,
      event_tempat: DataTypes.STRING,
      event_waktu: DataTypes.TIME,
      event_poster: DataTypes.TEXT,
      event_juknis: DataTypes.TEXT,
      event_biaya_pendaftaran: DataTypes.BIGINT,
      event_deskripsi: DataTypes.TEXT,
      event_status: DataTypes.ENUM("draft", "published", "archived"),
      is_result_show: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      event_batas_pendaftaran: DataTypes.DATE,
      event_contact_person_name: DataTypes.STRING,
      event_contact_person_number: DataTypes.STRING,
      event_penyelenggara: DataTypes.STRING,
      event_kuota: DataTypes.INTEGER,
      donasi_mulai: DataTypes.DATE,
      donasi_selesai: DataTypes.DATE,
      xenplatform_id: DataTypes.STRING,
      xenplatform_data: DataTypes.TEXT,
      qris_data: DataTypes.TEXT,
      kejuaraan_template: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      kategori_options: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      balance: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
      },
      koordinator_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "Users",
          key: "user_id",
        },
      },
    },
    {
      sequelize,
      modelName: "Events",
      tableName: "Events",
    },
  );
  return Events;
};
