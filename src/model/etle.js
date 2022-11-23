const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Etle extends Model {}
Etle.init(
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
    address_etle: {
      type: Sequelize.TEXT,
    },
    vms_etle: {
      type: Sequelize.TEXT,
    },
    jenis_etle: {
      type: Sequelize.STRING(255),
    },
    merek_etle: {
      type: Sequelize.STRING(255),
    },
    type_etle: {
      type: Sequelize.STRING(255),
    },
    ip_etle: {
      type: Sequelize.STRING(255),
    },
    gateway_etle: {
      type: Sequelize.STRING(255),
    },
    username_etle: {
      type: Sequelize.STRING(255),
    },
    password_etle: {
      type: Sequelize.STRING(255),
    },
    lat_etle: {
      type: Sequelize.TEXT,
    },
    lng_etle: {
      type: Sequelize.TEXT,
    },
    link_etle: {
      type: Sequelize.TEXT,
    },
    status_etle: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: { where: Sequelize.literal("Etle.deleted_at is null") },
    scopes: {
      deleted: {
        where: Sequelize.literal("Etle.deleted_at is null"),
      },
    },
    // indexes: [{ fields: ["role_id"] }],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "etle",
    modelName: "etle",
    sequelize: db,
  }
);
(async () => {
  Etle.sync({ alter: true });
})();
module.exports = Etle;
