const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Regulation_doc extends Model {}
Regulation_doc.init(
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
    regulation_category: {
      type: Sequelize.INTEGER,
    },
    regulation_name: {
      type: Sequelize.STRING(255),
    },
    fileReg: {
      type: Sequelize.TEXT,
    },
    year: {
      type: Sequelize.STRING(255),
    },

    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "regulation_doc",
    modelName: "regulation_docs",
    sequelize: db,
  }
);
(async () => {
  Regulation_doc.sync({ alter: true }).catch((err) => {
    console.log({ err });
  });
})();
module.exports = Regulation_doc;
