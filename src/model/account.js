const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Polres = require("./polres");
const Vehicle = require("./vehicle");
const Vip = require("./vip");
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
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    name_account: {
      type: Sequelize.STRING(50),
    },
    leader_team: {
      type: Sequelize.STRING(200),
    },
    id_vehicle: {
      type: Sequelize.INTEGER,
    },
    id_vip: {
      type: Sequelize.INTEGER,
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
    indexes: [{ fields: ["polres_id"] }],
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
Account.hasOne(Polres, {
  foreignKey: "id",
  as: "polres",
  sourceKey: "polres_id",
});
Account.hasOne(Vehicle, {
  foreignKey: "id",
  as: "vehicle",
  sourceKey: "id_vehicle",
});
Account.hasOne(Vip, { foreignKey: "id", as: "vips", sourceKey: "id_vip" });
(async () => {
  Account.sync({ alter: true });
})();
module.exports = Account;
