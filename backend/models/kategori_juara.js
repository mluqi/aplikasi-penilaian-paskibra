"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Kategori_juara extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Kategori_juara.belongsTo(models.Events, { foreignKey: "event_id" });
    }
  }
  Kategori_juara.init(
    {
      event_id: {
        type: DataTypes.STRING,
        references: {
          model: "Events",
          key: "event_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      nama_kategori: DataTypes.STRING,
      tipe_penilaian: DataTypes.ENUM("global", "aspek", "lainnya"),
      urutan: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      aspek_id: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      kurangi_penalty: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_juara_umum: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      jenis_juara: {
        type: DataTypes.ENUM("juara_umum", "juara_peringkat", "juara_kategori"),
        defaultValue: "juara_kategori",
        allowNull: true,
      },
      limit_juara: {
        type: DataTypes.INTEGER,
        defaultValue: null,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Kategori_juara",
      tableName: "Kategori_juaras",
      timestamps: false,
    },
  );
  return Kategori_juara;
};
