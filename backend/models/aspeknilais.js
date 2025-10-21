"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AspekNilais extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      AspekNilais.belongsTo(models.Penilaian, { foreignKey: "penilaian_id" });
      AspekNilais.belongsTo(models.Aspeks, { foreignKey: "aspek_id" });
      AspekNilais.hasMany(models.SubAspekNilais, {
        foreignKey: "aspeknilai_id",
      });
    }
  }
  AspekNilais.init(
    {
      penilaian_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "Penilaians",
          key: "penilaian_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
      nilai_aspek: DataTypes.DECIMAL(5, 2),
    },
    {
      sequelize,
      modelName: "AspekNilais",
    }
  );
  return AspekNilais;
};
