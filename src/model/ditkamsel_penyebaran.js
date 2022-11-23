const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Ditkamsel_penyebaran extends Model {}
Ditkamsel_penyebaran.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")));
      },
    },
    id_penyebaran: {
      type: Sequelize.INTEGER,
    },
    id_ditkamsel: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: Sequelize.literal("ditkamsel_penyebaran.deleted_at is null"),
    },
    scopes: {
      deleted: {
        where: Sequelize.literal("ditkamsel_penyebaran.deleted_at is null"),
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "ditkamsel_penyebaran",
    modelName: "ditkamsel_penyebaran",
    sequelize: db,
  }
);

(async () => {
  Ditkamsel_penyebaran.sync({ alter: true });
})();

module.exports = Ditkamsel_penyebaran;
