const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Ntmc_aktivitas_pengaduan extends Model {}
Ntmc_aktivitas_pengaduan.init(
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
    radio_pjr: {
      type: Sequelize.INTEGER,
    },
    sms_9119: {
      type: Sequelize.INTEGER,
    },
    wa_center: {
      type: Sequelize.INTEGER,
    },
    call_center: {
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
    tableName: "ntmc_aktivitas_pengaduan",
    modelName: "ntmc_aktivitas_pengaduan",
    sequelize: db,
  }
);

(async () => {
  Ntmc_aktivitas_pengaduan.sync({ alter: true });
})();
module.exports = Ntmc_aktivitas_pengaduan;
