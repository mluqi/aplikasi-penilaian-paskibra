"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Event_penalties extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Event_penalties.belongsTo(models.Events, {
        foreignKey: "event_id",
        as: "events",
      });
      Event_penalties.hasMany(models.Team_penalties, {
        foreignKey: "event_penalty_id",
        as: "team_penalties",
      });
    }
  }
  Event_penalties.init(
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
      nama_pelanggaran: DataTypes.STRING,
      poin_potongan: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Event_penalties",
      timestamps: false,
    },
  );
  return Event_penalties;
};
