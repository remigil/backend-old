const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Samsat extends Model {}
Samsat.init(
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
    name_samsat: {
      type: Sequelize.STRING(255),
    },
    address: {
      type: Sequelize.STRING(255),
    },
    samsat_lat: {
      type: Sequelize.TEXT,
    },
    samsat_lng: {
      type: Sequelize.TEXT,
    },
    samsat_open_time: {
      type: Sequelize.TEXT,
    },
    samsat_close_time: {
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
    tableName: "samsat",
    modelName: "samsat",
    sequelize: db,
  }
);
(async () => {
  Samsat.sync({ alter: true });
})();
module.exports = Samsat;
