const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Account extends Model {}
Account.init(
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
    polres_id: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    name_account: {
      type: Sequelize.STRING(50),
    },
    leader_team: {
      type: Sequelize.STRING(200),
    },
    id_vehicle: {
      type: Sequelize.TEXT,
    },
    id_vip: {
      type: Sequelize.TEXT,
    },
    password: {
      type: Sequelize.TEXT,
      set(value) {
        this.setDataValue(
          "password",
          bcrypt.hashSync(value, bcrypt.genSaltSync(10))
        );
      },
    },
    id_account: {
      type: Sequelize.STRING(50),
    },
    ...StructureTimestamp,
  },
  {
    // indexes: [{ fields: ["polres_id"] }],
    defaultScope: { where: Sequelize.literal("accounts.deleted_at is null") },
    scopes: {
      deleted: {
        where: Sequelize.literal("accounts.deleted_at is null"),
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "account",
    modelName: "accounts",
    sequelize: db,
  }
);
(async () => {
  Account.sync({ alter: true });
})();
module.exports = Account;
