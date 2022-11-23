const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Input_garlantas extends Model {}
Input_garlantas.init(
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
    date: {
      type: Sequelize.DATEONLY,
    },
    pelanggaran_berat: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    pelanggaran_sedang: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    pelanggaran_ringan: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    teguran: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
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
    tableName: "input_garlantas",
    modelName: "input_garlantas",
    sequelize: db,
  }
);
(async () => {
  Input_garlantas.sync({ alter: true });
})();
module.exports = Input_garlantas;
