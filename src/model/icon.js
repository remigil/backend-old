const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Polda = require("./polda");
const Model = Sequelize.Model;

class Icon extends Model {}
Icon.init(
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
    name_icon: {
      type: Sequelize.STRING(255),
    },
    photo_icon: {
      type: Sequelize.TEXT,
    },
    deskripsi_icon: {
      type: Sequelize.TEXT,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        // Sequelize.literal("Icon.deleted_at is null")
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          // Sequelize.literal("Icon.deleted_at is null")
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "icon",
    modelName: "icon",
    sequelize: db,
  }
);

(async () => {
  Icon.sync({ alter: true }).catch((err) => {
    console.log({ err });
  });
})();
module.exports = Icon;
