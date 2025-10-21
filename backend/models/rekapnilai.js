"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RekapNilai extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      RekapNilai.belongsTo(models.Events, { foreignKey: "event_id" });
      RekapNilai.belongsTo(models.Teams, { foreignKey: "team_id" });
    }
  }
  RekapNilai.init(
    {
      rekapnilai_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      event_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "Events",
          key: "event_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      team_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "Teams",
          key: "team_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      nilai_akhir: DataTypes.DECIMAL(5, 2),
      jumlah_juri: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "RekapNilai",
      tableName: "rekapnilai",
      timestamps: false,
    }
  );
  return RekapNilai;
};
