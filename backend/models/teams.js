"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Teams extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Teams.belongsTo(models.Users, {
        as: "User",
        foreignKey: "koordinator_id",
      });
      Teams.hasMany(models.Anggota_team, { foreignKey: "team_id" });
      Teams.hasMany(models.Penilaian, { foreignKey: "team_id" });
      Teams.hasMany(models.Event_teams, { foreignKey: "team_id" });
      Teams.hasMany(models.RekapNilai, { foreignKey: "team_id" });
    }
  }
  Teams.init(
    {
      team_id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      team_name: DataTypes.STRING,
      team_sekolah_instansi: DataTypes.STRING,
      team_jumlah_anggota: DataTypes.INTEGER,
      team_logo: DataTypes.TEXT,
      koordinator_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "Users",
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: "Teams",
      tableName: "Teams",
    }
  );
  return Teams;
};
