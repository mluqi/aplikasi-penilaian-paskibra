"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Team_penalties extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Team_penalties.belongsTo(models.Events, {
        foreignKey: "event_id",
        as: "events",
      });
      Team_penalties.belongsTo(models.Teams, {
        foreignKey: "team_id",
        as: "teams",
      });
      Team_penalties.belongsTo(models.Event_penalties, {
        foreignKey: "event_penalty_id",
        as: "event_penalty",
      });
      Team_penalties.belongsTo(models.Users, {
        foreignKey: "input_by",
        as: "users",
      });
    }
  }
  Team_penalties.init(
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
      event_penalty_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Event_penalties",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      jumlah: DataTypes.INTEGER,
      total_pengurangan: DataTypes.INTEGER,
      catatan: DataTypes.STRING,
      input_by: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Team_penalties",
      timestamps: false,
    },
  );
  return Team_penalties;
};
