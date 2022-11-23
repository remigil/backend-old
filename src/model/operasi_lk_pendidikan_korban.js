const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Operasi_lk_pendidikan_korban extends Model {}
Operasi_lk_pendidikan_korban.init(
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
    sd: {
      type: Sequelize.INTEGER,
    },
    sltp: {
      type: Sequelize.INTEGER,
    },
    slta: {
      type: Sequelize.INTEGER,
    },
    d3: {
      type: Sequelize.INTEGER,
    },
    s1: {
      type: Sequelize.INTEGER,
    },
    s2: {
      type: Sequelize.INTEGER,
    },
    tidak_diketahui: {
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
    tableName: "operasi_lk_pendidikan_korban",
    modelName: "operasi_lk_pendidikan_korban",
    sequelize: db,
  }
);

(async () => {
  Operasi_lk_pendidikan_korban.sync({ alter: true });
})();
module.exports = Operasi_lk_pendidikan_korban;
