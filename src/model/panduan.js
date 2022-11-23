const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Panduan extends Model {}
Panduan.init(
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
    name_panduan: {
      type: Sequelize.STRING(255),
    },
    file_panduan: {
      type: Sequelize.TEXT,
    },

    ...StructureTimestamp,
  },
  {
    defaultScope: { where: {
      deleted_at: null
    } },
    scopes: {
      deleted: {
        where: {
          deleted_at: null
        },
      },    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "panduan",
    modelName: "panduans",
    sequelize: db,
  }
);
(async () => {
  Panduan.sync({ alter: true });
})();
module.exports = Panduan;
