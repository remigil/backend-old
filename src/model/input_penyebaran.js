const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Input_penyebaran extends Model {}
Input_penyebaran.init(
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
    spanduk: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    leaflet: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    stiker: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    billboard: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    jemensosprek: {
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
    tableName: "input_penyebaran",
    modelName: "input_penyebaran",
    sequelize: db,
  }
);

(async () => {
  Input_penyebaran.sync({ alter: true });
})();
module.exports = Input_penyebaran;
