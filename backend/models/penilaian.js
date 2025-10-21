"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Penilaian extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Penilaian.belongsTo(models.Events, { foreignKey: "event_id" });
      Penilaian.belongsTo(models.Teams, { foreignKey: "team_id" });
      Penilaian.belongsTo(models.Users, { foreignKey: "juri_id" });
      Penilaian.hasMany(models.AspekNilais, { foreignKey: "penilaian_id" });
    }
  }
  Penilaian.init(
    {
      penilaian_id: {
        type: DataTypes.STRING,
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
      juri_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "Users",
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      total_nilai: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      catatan: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_lock: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Penilaian",
      tableName: "Penilaians",
      timestamps: false,
    }
  );
  return Penilaian;
};
