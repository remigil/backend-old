const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Operasi_lg_profesi extends Model {}
Operasi_lg_profesi.init(
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
    mahasiswa_pelajar: {
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
    tableName: "operasi_lg_profesi",
    modelName: "operasi_lg_profesi",
    sequelize: db,
  }
);

(async () => {
  Operasi_lg_profesi.sync({ alter: true });
})();
module.exports = Operasi_lg_profesi;
