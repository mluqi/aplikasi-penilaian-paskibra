"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Event_asisten extends Model {
    static associate(models) {
      Event_asisten.belongsTo(models.Events, { foreignKey: "event_id" });
      Event_asisten.belongsTo(models.Users, {
        as: "User",
        foreignKey: "asisten_id",
      });
    }
  }
  Event_asisten.init(
    {
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
      asisten_id: {
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
      modelName: "Event_asisten",
      tableName: "Event_asistens",
      timestamps: false,
    },
  );
  return Event_asisten;
};
