const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Type_vehicle = require("./type_vehicle");
const Brand_vehicle = require("./brand_vehicle");
const Society = require("./society");
const Model = Sequelize.Model;

class Public_vehicle extends Model {}
Public_vehicle.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    no_vehicle: {
      type: Sequelize.STRING(100),
    },
    brand_id: {
      type: Sequelize.INTEGER,
    },
    type_id: {
      type: Sequelize.INTEGER,
    },
    society_id: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    indexes: [{ fields: ["brand_id", "type_id", "society_id"] }],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "public_vehicle",
    modelName: "public_vehicle",
    sequelize: db,
  }
);

Public_vehicle.hasOne(Type_vehicle, {
  foreignKey: "id",
  sourceKey: "type_id",
});
Public_vehicle.hasOne(Brand_vehicle, {
  foreignKey: "id",
  sourceKey: "brand_id",
});
Public_vehicle.hasOne(Society, {
  foreignKey: "id",
  sourceKey: "society_id",
});

(async () => {
  Public_vehicle.sync({ alter: true });
})();
module.exports = Public_vehicle;
