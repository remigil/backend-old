const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Vip extends Model {}
Vip.init(
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
    name_vip: {
      type: Sequelize.STRING(100),
    },
    country_arrival_vip: {
      type: Sequelize.STRING(255),
    },
    position_vip: {
      type: Sequelize.STRING(255),
    },
    description_vip: {
      type: Sequelize.TEXT,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: { where: Sequelize.literal("vips.deleted_at is null") },
    scopes: {
      deleted: {
        where: Sequelize.literal("vips.deleted_at is null"),
      },
    },
    // indexes: [{ fields: ["role_id"] }],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "vip",
    modelName: "vips",
    sequelize: db,
  }
);
(async () => {
  Vip.sync({ alter: true });
})();
module.exports = Vip;
