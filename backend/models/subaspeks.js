"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SubAspeks extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SubAspeks.belongsTo(models.Aspeks, { foreignKey: "aspek_id" });
      SubAspeks.hasMany(models.SubAspekNilais, {
        foreignKey: "subaspek_id",
        sourceKey: "subaspek_id",
      });
    }
  }
  SubAspeks.init(
    {
      subaspek_id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      aspek_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "Aspeks",
          key: "aspek_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      nama_subaspek: DataTypes.STRING,
      bobot: DataTypes.DECIMAL(5, 2),
      urutan: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "SubAspeks",
      tableName: "SubAspeks",
      timestamps: false,
    }
  );
  return SubAspeks;
};
