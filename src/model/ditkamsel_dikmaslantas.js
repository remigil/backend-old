const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Ditkamsel_dikmaslantas extends Model {}
Ditkamsel_dikmaslantas.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")));
      },
    },
    id_dikmaslantas: {
      type: Sequelize.INTEGER,
    },
    id_ditkamsel: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: Sequelize.literal("ditkamsel_dikmaslantas.deleted_at is null"),
    },
    scopes: {
      deleted: {
        where: Sequelize.literal("ditkamsel_dikmaslantas.deleted_at is null"),
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "ditkamsel_dikmaslantas",
    modelName: "ditkamsel_dikmaslantas",
    sequelize: db,
  }
);

(async () => {
  Ditkamsel_dikmaslantas.sync({ alter: true });
})();

module.exports = Ditkamsel_dikmaslantas;
