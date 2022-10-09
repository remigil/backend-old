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
    vip_id: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: Sequelize.literal("renpam_vips.deleted_at is null"),
    },
    scopes: {
      deleted: {
        where: Sequelize.literal("renpam_vips.deleted_at is null"),
      },
    },
    indexes: [{ fields: ["vip_id", "renpam_id"] }],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "renpam_vip",
    modelName: "renpam_vips",
    sequelize: db,
  }
);
(async () => {
  RenpamAccount.sync({ alter: true });
})();
module.exports = RenpamAccount;
