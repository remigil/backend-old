const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Operasi_lg_kendaraan extends Model {}
Operasi_lg_kendaraan.init(
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
    sepeda_motor: {
      type: Sequelize.INTEGER,
    },
    mobil_penumpang: {
      type: Sequelize.INTEGER,
    },
    bus: {
      type: Sequelize.INTEGER,
    },
    mobil_barang: {
      type: Sequelize.INTEGER,
    },
    ransus: {
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
    tableName: "operasi_lg_kendaraan",
    modelName: "operasi_lg_kendaraan",
    sequelize: db,
  }
);

(async () => {
  Operasi_lg_kendaraan.sync({ alter: true });
})();
module.exports = Operasi_lg_kendaraan;
