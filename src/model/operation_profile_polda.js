const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");

const Model = Sequelize.Model;

class OperationProfilePolda extends Model {}
OperationProfilePolda.init(
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
    polda_id: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: Sequelize.literal("operation_profile_polda.deleted_at is null"),
    },
    scopes: {
      deleted: {
        where: Sequelize.literal("operation_profile_polda.deleted_at is null"),
      },
    },
    indexes: [{ fields: ["operation_profile_id", "polda_id"] }],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "operation_profile_polda",
    modelName: "operation_profile_polda",
    sequelize: db,
  }
);
(async () => {
  OperationProfilePolda.sync({ alter: true });
})();
module.exports = OperationProfilePolda;
