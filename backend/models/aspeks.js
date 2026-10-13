"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Aspeks extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Aspeks.belongsTo(models.Events, { foreignKey: "event_id" });
      Aspeks.hasMany(models.SubAspeks, {
        foreignKey: "aspek_id",
      });
      Aspeks.belongsToMany(models.Event_juri, {
        through: models.Event_juri_aspeks,
        foreignKey: "aspek_id",
        otherKey: "event_juri_id",
      });
    }
  }
  Aspeks.init(
    {
      aspek_id: {
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
      nama_aspek: { type: DataTypes.STRING, allowNull: false },
      urutan: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Aspeks",
      tableName: "Aspeks",
      timestamps: false,
    },
  );
  return Aspeks;
};
