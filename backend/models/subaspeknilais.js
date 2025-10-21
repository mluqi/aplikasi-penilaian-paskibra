"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SubAspekNilais extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SubAspekNilais.belongsTo(models.SubAspeks, { foreignKey: "subaspek_id" });
      SubAspekNilais.belongsTo(models.AspekNilais, {
        foreignKey: "aspeknilai_id",
      });
    }
  }
  SubAspekNilais.init(
    {
      aspeknilai_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "AspekNilais",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      subaspek_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "SubAspeks",
          key: "subaspek_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      nilai: DataTypes.DECIMAL(5, 2),
    },
    {
      sequelize,
      modelName: "SubAspekNilais",
    }
  );
  return SubAspekNilais;
};
