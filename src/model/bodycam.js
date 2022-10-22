const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Bodycam extends Model {}
Bodycam.init(
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
    address_bodycam: {
      type: Sequelize.TEXT,
    },
    vms_bodycam: {
      type: Sequelize.TEXT,
    },
    jenis_bodycam: {
      type: Sequelize.STRING(255),
    },
    merek_bodycam: {
      type: Sequelize.STRING(255),
    },
    type_bodycam: {
      type: Sequelize.STRING(255),
    },
    ip_bodycam: {
      type: Sequelize.STRING(255),
    },
    gateway_bodycam: {
      type: Sequelize.STRING(255),
    },
    username_bodycam: {
      type: Sequelize.STRING(255),
    },
    password_bodycam: {
      type: Sequelize.STRING(255),
    },
    lat_bodycam: {
      type: Sequelize.TEXT,
    },
    lng_bodycam: {
      type: Sequelize.TEXT,
    },
    link_bodycam: {
      type: Sequelize.TEXT,
    },
    status_bodycam: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: { where: Sequelize.literal("bodycam.deleted_at is null") },
    scopes: {
      deleted: {
        where: Sequelize.literal("bodycam.deleted_at is null"),
      },
    },
    // indexes: [{ fields: ["role_id"] }],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "bodycam",
    modelName: "bodycam",
    sequelize: db,
  }
);
(async () => {
  Bodycam.sync({ alter: true }).catch((err) => {
    console.log({ err });
  });
})();
module.exports = Bodycam;
