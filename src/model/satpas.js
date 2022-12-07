const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Satpas extends Model {}
Satpas.init(
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
    name_satpas: {
      type: Sequelize.STRING(255),
    },
    address: {
      type: Sequelize.STRING(255),
    },
    satpas_lat: {
      type: Sequelize.TEXT,
    },
    satpas_lng: {
      type: Sequelize.TEXT,
    },
    satpas_open_time: {
      type: Sequelize.TEXT,
    },
    satpas_close_time: {
      type: Sequelize.TEXT,
    },
    polda_id: {
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
    tableName: "satpas",
    modelName: "satpas",
    sequelize: db,
  }
);
(async () => {
  Satpas.sync({ alter: true });
})();
module.exports = Satpas;
