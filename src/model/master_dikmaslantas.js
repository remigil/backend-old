const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Master_dikmaslantas extends Model {}
Master_dikmaslantas.init(
  {
    id_dikmaslantas: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id_dikmaslantas")), {
          isSafeUrl: true,
        });
      },
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
      where: Sequelize.literal("master_dikmaslantas.deleted_at is null"),
    },
    scopes: {
      deleted: {
        where: Sequelize.literal("master_dikmaslantas.deleted_at is null"),
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "master_dikmaslantas",
    modelName: "master_dikmaslantas",
    sequelize: db,
  }
);

(async () => {
  Master_dikmaslantas.sync({ alter: true });
})();

module.exports = Master_dikmaslantas;
