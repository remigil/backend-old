const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Cctv extends Model {}
Cctv.init(
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
    address_cctv: {
      type: Sequelize.TEXT,
    },
    vms_cctv: {
      type: Sequelize.TEXT,
    },
    jenis_cctv: {
      type: Sequelize.STRING(255),
    },
    merek_cctv: {
      type: Sequelize.STRING(255),
    },
    type_cctv: {
      type: Sequelize.STRING(255),
    },
    ip_cctv: {
      type: Sequelize.STRING(255),
    },
    gateway_cctv: {
      type: Sequelize.STRING(255),
    },
    username_cctv: {
      type: Sequelize.STRING(255),
    },
    password_cctv: {
      type: Sequelize.STRING(255),
    },
    lat_cctv: {
      type: Sequelize.TEXT,
    },
    lng_cctv: {
      type: Sequelize.TEXT,
    },
    link_cctv: {
      type: Sequelize.TEXT,
    },
    status_cctv: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: { where: Sequelize.literal("Cctv.deleted_at is null") },
    scopes: {
      deleted: {
        where: Sequelize.literal("Cctv.deleted_at is null"),
      },
    },
    // indexes: [{ fields: ["role_id"] }],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "cctv",
    modelName: "cctv",
    sequelize: db,
  }
);
(async () => {
  Cctv.sync({ alter: true });
})();
module.exports = Cctv;
