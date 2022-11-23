const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Input_dikmaslantas extends Model {}
Input_dikmaslantas.init(
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
    media_cetak: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    media_elektronik: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    media_sosial: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    laka_langgar: {
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
    tableName: "input_dikmaslantas",
    modelName: "input_dikmaslantas",
    sequelize: db,
  }
);
(async () => {
  Input_dikmaslantas.sync({ alter: true });
})();
module.exports = Input_dikmaslantas;
