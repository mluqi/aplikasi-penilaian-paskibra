"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class role_access extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      role_access.belongsTo(models.roles, { foreignKey: "role_id" });
      role_access.belongsTo(models.menus, { foreignKey: "menu_id" });
    }
  }
  role_access.init(
    {
      role_access_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        autoIncrement: true,
      },
      role_id: DataTypes.STRING,
      menu_id: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "role_access",
      tableName: "role_access",
      timestamps: false,
    }
  );
  return role_access;
};
