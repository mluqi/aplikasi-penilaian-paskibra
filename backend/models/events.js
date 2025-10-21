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
      Events.hasMany(models.Event_teams, { foreignKey: "event_id" });
      Events.hasMany(models.Penilaian, { foreignKey: "event_id" });
      Events.hasMany(models.Aspeks, { foreignKey: "event_id" });
      Events.hasMany(models.RekapNilai, { foreignKey: "event_id" });
    }
  }
  Events.init(
    {
      event_id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      event_name: DataTypes.STRING,
      event_kategori: DataTypes.ENUM("smp", "sma_smk", "mahasiswa", "umum"),
      event_tingkat: DataTypes.ENUM("kota_kabupaten", "provinsi", "nasional"),
      event_provinsi: DataTypes.STRING,
      event_kota: DataTypes.STRING,
      event_tanggal: DataTypes.DATE,
      event_tempat: DataTypes.STRING,
      event_waktu: DataTypes.TIME,
      event_poster: DataTypes.TEXT,
      event_biaya_pendaftaran: DataTypes.BIGINT,
      event_deskripsi: DataTypes.TEXT,
      event_status: DataTypes.ENUM("draft", "published", "archived"),
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
    }
  );
  return Events;
};
