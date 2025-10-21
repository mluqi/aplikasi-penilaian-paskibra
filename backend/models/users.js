"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Users.hasMany(models.Teams, { foreignKey: "koordinator_id" });
      Users.hasMany(models.Event_juri, { foreignKey: "juri_id" });
      Users.hasMany(models.Penilaian, { foreignKey: "juri_id" });
    }
  }
  Users.init(
    {
      user_id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      user_name: DataTypes.STRING,
      user_email: DataTypes.STRING,
      user_password: DataTypes.STRING,
      user_role: DataTypes.ENUM(
        "superadmin",
        "admin",
        "juri",
        "koordinator_team",
        "koordinator_event"
      ),
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      user_photo: DataTypes.TEXT,
      user_token: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Users",
      tableName: "Users",
    }
  );
  return Users;
};
