const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Ntmc_onair_mediatv extends Model {}
Ntmc_onair_mediatv.init(
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
    program: {
      type: Sequelize.INTEGER,
    },
    live_report: {
      type: Sequelize.INTEGER,
    },
    live_program: {
      type: Sequelize.INTEGER,
    },
    tapping: {
      type: Sequelize.INTEGER,
    },
    vlog_cctv: {
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
    tableName: "ntmc_onair_mediatv",
    modelName: "ntmc_onair_mediatv",
    sequelize: db,
  }
);

(async () => {
  Ntmc_onair_mediatv.sync({ alter: true });
})();
module.exports = Ntmc_onair_mediatv;
