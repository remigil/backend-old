const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Input_ranmor extends Model {}
Input_ranmor.init(
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
    mobil_penumpang: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    mobil_barang: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    mobil_bus: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    ransus: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    sepeda_motor: {
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
    tableName: "input_ranmor",
    modelName: "input_ranmor",
    sequelize: db,
  }
);

(async () => {
  Input_ranmor.sync({ alter: true });
})();

module.exports = Input_ranmor;
