const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Operasi_lg_usia extends Model {}
Operasi_lg_usia.init(
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
    max_15: {
      type: Sequelize.INTEGER,
    },
    max_20: {
      type: Sequelize.INTEGER,
    },
    max_25: {
      type: Sequelize.INTEGER,
    },
    max_30: {
      type: Sequelize.INTEGER,
    },
    max_35: {
      type: Sequelize.INTEGER,
    },
    max_40: {
      type: Sequelize.INTEGER,
    },
    max_45: {
      type: Sequelize.INTEGER,
    },
    max_50: {
      type: Sequelize.INTEGER,
    },
    max_55: {
      type: Sequelize.INTEGER,
    },
    max_55: {
      type: Sequelize.INTEGER,
    },
    max_60: {
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
    tableName: "operasi_lg_usia",
    modelName: "operasi_lg_usia",
    sequelize: db,
  }
);

(async () => {
  Operasi_lg_usia.sync({ alter: true });
})();
module.exports = Operasi_lg_usia;
