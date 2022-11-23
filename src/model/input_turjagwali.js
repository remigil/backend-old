const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Input_turjagwali extends Model {}
Input_turjagwali.init(
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
    pengaturan: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    penjagaan: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    pengawalan: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    patroli: {
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
    tableName: "input_turjagwali",
    modelName: "input_turjagwali",
    sequelize: db,
  }
);

(async () => {
  Input_turjagwali.sync({ alter: true });
})();
module.exports = Input_turjagwali;
