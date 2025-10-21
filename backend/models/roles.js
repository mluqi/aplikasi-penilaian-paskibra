"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class roles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      roles.hasMany(models.role_access, { foreignKey: "role_id" });
    }
  }
  roles.init(
    {
      role_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      role_name: DataTypes.STRING,
      role_description: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "roles",
      tableName: "roles",
      timestamps: false,
    }
  );
  return roles;
};
