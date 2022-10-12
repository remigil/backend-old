const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");

const Model = Sequelize.Model;

class OperationProfilePolres extends Model {}
OperationProfilePolres.init(
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
    operation_profile_id: {
      type: Sequelize.INTEGER,
    },
    polres_id: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: Sequelize.literal("operation_profile_polres.deleted_at is null"),
    },
    scopes: {
      deleted: {
        where: Sequelize.literal("operation_profile_polres.deleted_at is null"),
      },
    },
    indexes: [{ fields: ["operation_profile_id", "polres_id"] }],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "operation_profile_polres",
    modelName: "operation_profile_polres",
    sequelize: db,
  }
);
(async () => {
  OperationProfilePolres.sync({ alter: true }).catch((err) => {
    console.log({ err });
  });
})();
module.exports = OperationProfilePolres;
