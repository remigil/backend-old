const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Operasi_lk_usia_korban extends Model {}
Operasi_lk_usia_korban.init(
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
    max_4: {
      type: Sequelize.INTEGER,
    },
    max_9: {
      type: Sequelize.INTEGER,
    },
    max_14: {
      type: Sequelize.INTEGER,
    },
    max_19: {
      type: Sequelize.INTEGER,
    },
    max_24: {
      type: Sequelize.INTEGER,
    },
    max_34: {
      type: Sequelize.INTEGER,
    },
    max_39: {
      type: Sequelize.INTEGER,
    },
    max_44: {
      type: Sequelize.INTEGER,
    },
    max_49: {
      type: Sequelize.INTEGER,
    },
    max_54: {
      type: Sequelize.INTEGER,
    },
    max_49: {
      type: Sequelize.INTEGER,
    },
    max_54: {
      type: Sequelize.INTEGER,
    },
    max_59: {
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
    tableName: "operasi_lk_usia_korban",
    modelName: "operasi_lk_usia_korban",
    sequelize: db,
  }
);

(async () => {
  Operasi_lk_usia_korban.sync({ alter: true });
})();
module.exports = Operasi_lk_usia_korban;
