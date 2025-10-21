"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class log_akses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  log_akses.init(
    {
      akses_user: DataTypes.STRING,
      akses_ip: DataTypes.STRING,
      akses_browser: DataTypes.STRING,
      akses_status: DataTypes.STRING,
      akses_record: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "log_akses",
      timestamps: false,
    }
  );
  return log_akses;
};
