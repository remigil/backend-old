const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Laporan_upload_anev extends Model {}
Laporan_upload_anev.init(
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
    title: {
      type: Sequelize.TEXT,
    },
    file: {
      type: Sequelize.TEXT,
    },
    cover: {
      type: Sequelize.TEXT,
    },
    date: {
      type: Sequelize.STRING(30),
    },
    tipe: {
      type: Sequelize.STRING(30),
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
    tableName: "laporan_upload_anev",
    modelName: "laporan_upload_anev",
    sequelize: db,
  }
);

(async () => {
  Laporan_upload_anev.sync({ alter: true });
})();
module.exports = Laporan_upload_anev;
