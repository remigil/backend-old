const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Master_penyebaran extends Model {}
Master_penyebaran.init(
  {
    id_penyebaran: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id_penyebaran")), {
          isSafeUrl: true,
        });
      },
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
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: Sequelize.literal("master_penyebaran.deleted_at is null"),
    },
    scopes: {
      deleted: {
        where: Sequelize.literal("master_penyebaran.deleted_at is null"),
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "master_penyebaran",
    modelName: "master_penyebaran",
    sequelize: db,
  }
);

(async () => {
  Master_penyebaran.sync({ alter: true });
})();

module.exports = Master_penyebaran;
