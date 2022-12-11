const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Laporan_harian extends Model {}
Laporan_harian.init(
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
    date: {
      type: Sequelize.DATEONLY,
    },
    kategori_laporan: {
      type: Sequelize.INTEGER,
    },
    judul: {
      type: Sequelize.TEXT,
    },
    url: {
      type: Sequelize.TEXT,
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
    tableName: "laporan_harian",
    modelName: "laporan_harian",
    sequelize: db,
  }
);
(async () => {
  Laporan_harian.sync({ alter: true });
})();
module.exports = Laporan_harian;
