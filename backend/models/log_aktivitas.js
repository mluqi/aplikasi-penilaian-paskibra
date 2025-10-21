'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class log_aktivitas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  log_aktivitas.init({
    log_target: DataTypes.STRING,
    log_action: DataTypes.STRING,
    log_detail: DataTypes.TEXT,
    log_source: DataTypes.TEXT,
    log_record: DataTypes.DATE,
    log_owner: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'log_aktivitas',
    timestamps: false,
  });
  return log_aktivitas;
};