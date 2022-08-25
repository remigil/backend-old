const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Vehicle = require("./vehicle");
const Vip = require("./vip");
const Officer = require("./officer");
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
    operation_id: {
      type: Sequelize.INTEGER,
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

    ...StructureTimestamp,
  },
  {
    indexes: [{ fields: ["id_vip", "id_vehicle"] }],
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

Account.hasOne(Vehicle, {
  foreignKey: "id",
  as: "vehicle",
  sourceKey: "id_vehicle",
});
Account.hasOne(Vip, { foreignKey: "id", as: "vips", sourceKey: "id_vip" });
Account.belongsToMany(Officer, {
  as: "officer",
  through: "trx_account_officer",
  foreignKey: "account_id",
  otherKey: "officer_id",
});
(async () => {
  Account.sync({ alter: true });
})();
module.exports = Account;
