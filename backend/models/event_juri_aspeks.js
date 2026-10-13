"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Event_juri_aspeks extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Event_juri_aspeks.init(
    {
      event_juri_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Event_juris",
          key: "id",
        },
      },
      aspek_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "Aspeks",
          key: "aspek_id",
        },
      },
    },
    {
      sequelize,
      modelName: "Event_juri_aspeks",
    },
  );
  return Event_juri_aspeks;
};
