"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Event_teams extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Event_teams.belongsTo(models.Events, { foreignKey: "event_id" });
      Event_teams.belongsTo(models.Teams, { foreignKey: "team_id" });
    }
  }
  Event_teams.init(
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
      team_id: {
        type: DataTypes.STRING,
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
      modelName: "Event_teams",
      tableName: "Event_teams",
      timestamps: false,
    }
  );
  return Event_teams;
};
