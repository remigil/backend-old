const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");

const Model = Sequelize.Model;

class RenpamAccount extends Model {}
RenpamAccount.init(
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
    renpam_id: {
      type: Sequelize.INTEGER,
    },
    account_id: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: Sequelize.literal("renpam_accounts.deleted_at is null"),
    },
    scopes: {
      deleted: {
        where: Sequelize.literal("renpam_accounts.deleted_at is null"),
      },
    },
    indexes: [{ fields: ["account_id", "renpam_id"] }],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "renpam_account",
    modelName: "renpam_accounts",
    sequelize: db,
  }
);
(async () => {
  RenpamAccount.sync({ alter: true }).catch((err) => {
    console.log({ err });
  });
})();
module.exports = RenpamAccount;
