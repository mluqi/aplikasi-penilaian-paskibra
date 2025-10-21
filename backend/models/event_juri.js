"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Event_juri extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Event_juri.belongsTo(models.Events, { foreignKey: "event_id" });
      Event_juri.belongsTo(models.Users, { foreignKey: "juri_id" });
    }
  }
  Event_juri.init(
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
      juri_id: {
        type: DataTypes.STRING,
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
      modelName: "Event_juri",
      tableName: "Event_juris",
      timestamps: false,
    }
  );
  return Event_juri;
};
