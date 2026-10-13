"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Donations extends Model {
    static associate(models) {
      Donations.belongsTo(models.Events, { foreignKey: "event_id" });
      Donations.belongsTo(models.Teams, { foreignKey: "team_id" });
    }
  }
  Donations.init(
    {
      donation_id: {
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
      amount: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
      payment_status: DataTypes.STRING, 
      xendit_transaction_id: DataTypes.STRING,
      payment_method: DataTypes.STRING,
      webhook_data: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Donations",
      tableName: "Donations",
    },
  );
  return Donations;
};
