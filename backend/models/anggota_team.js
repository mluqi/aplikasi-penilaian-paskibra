"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Anggota_team extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Anggota_team.belongsTo(models.Teams, { foreignKey: "team_id" });
    }
  }
  Anggota_team.init(
    {
      anggota_id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      anggota_nama: DataTypes.STRING,
      anggota_tempat_lahir: DataTypes.STRING,
      anggota_tanggal_lahir: DataTypes.DATE,
      anggota_is_danton: DataTypes.BOOLEAN,
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
    },
    {
      sequelize,
      modelName: "Anggota_team",
      tableName: "Anggota_teams",
    }
  );
  return Anggota_team;
};
