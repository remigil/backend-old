const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Type_brand_vehicle extends Model {}
Type_brand_vehicle.init(
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
    type_id: {
      type: Sequelize.INTEGER,
    },
    brand_id: {
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
    // indexes: [{ fields: ["type_id", "brand_id"] }],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "type_brand_vehicle",
    modelName: "type_brand vehicle",
    sequelize: db,
  }
);

// Type_brand_vehicle.hasOne(Type_vehicle, {
//   foreignKey: "id",
//   sourceKey: "type_id"
// });

// Type_brand_vehicle.hasOne(Brand_vehicle, {
//   foreignKey: "id",
//   sourceKey: "brand_id"
// });

// User.hasOne(UserRole, { foreignKey: "id" });
// (async () => {
//   Type_brand_vehicle.sync({ alter: true });
// })();
module.exports = Type_brand_vehicle;
