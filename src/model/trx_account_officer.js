const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");

const Model = Sequelize.Model;

class TrxAccountOfficer extends Model {}
TrxAccountOfficer.init(
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
    account_id: {
      type: Sequelize.INTEGER,
    },
    officer_id: {
      type: Sequelize.INTEGER,
    },
    vehicle_id: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: Sequelize.literal("trx_account_officers.deleted_at is null"),
    },
    scopes: {
      deleted: {
        where: Sequelize.literal("trx_account_officers.deleted_at is null"),
      },
    },
    // indexes: [{ fields: ["account_id", "officer_id", "vehicle_id"] }],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "trx_account_officer",
    modelName: "trx_account_officers",
    sequelize: db,
  }
);
(async () => {
  TrxAccountOfficer.sync({ alter: true });
})();
module.exports = TrxAccountOfficer;
