const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Sosmed extends Model {}
Sosmed.init(
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
    name_sosmed: {
      type: Sequelize.STRING(255),
    },
    link_sosmed: {
      type: Sequelize.STRING(255),
    },
    icon_sosmed: {
      type: Sequelize.TEXT,
    },

    ...StructureTimestamp,
  },
  {
    defaultScope: { where: Sequelize.literal("Sosmed.deleted_at is null") },
    scopes: {
      deleted: {
        where: Sequelize.literal("sosmed.deleted_at is null"),
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "sosmed",
    modelName: "sosmed",
    sequelize: db,
  }
);
(async () => {
  Sosmed.sync({ alter: true });
})();
module.exports = Sosmed;
