const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Operasi_lk_pekerjaan_pelaku extends Model {}
Operasi_lk_pekerjaan_pelaku.init(
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
    polda_id: {
      type: Sequelize.INTEGER,
    },
    polres_id: {
      type: Sequelize.INTEGER,
    },
    operasi_id: {
      type: Sequelize.INTEGER,
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    pns: {
      type: Sequelize.INTEGER,
    },
    karyawan: {
      type: Sequelize.INTEGER,
    },
    mahasiswa: {
      type: Sequelize.INTEGER,
    },
    pengemudi: {
      type: Sequelize.INTEGER,
    },
    tni: {
      type: Sequelize.INTEGER,
    },
    polri: {
      type: Sequelize.INTEGER,
    },
    lain_lain: {
      type: Sequelize.INTEGER,
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
    tableName: "operasi_lk_pekerjaan_pelaku",
    modelName: "operasi_lk_pekerjaan_pelaku",
    sequelize: db,
  }
);

(async () => {
  Operasi_lk_pekerjaan_pelaku.sync({ alter: true });
})();
module.exports = Operasi_lk_pekerjaan_pelaku;
