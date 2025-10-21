"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class menus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      menus.hasMany(models.role_access, { foreignKey: "menu_id" });
    }
  }
  menus.init(
    {
      menu_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      menu_name: DataTypes.STRING,
      menu_path: DataTypes.STRING,
      menu_description: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "menus",
      tableName: "menus",
      timestamps: false,
    }
  );
  return menus;
};
