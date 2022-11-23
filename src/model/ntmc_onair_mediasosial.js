const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Ntmc_onair_mediasosial extends Model {}
Ntmc_onair_mediasosial.init(
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
    date: {
      type: Sequelize.DATEONLY,
    },
    facebook: {
      type: Sequelize.INTEGER,
    },
    instagram: {
      type: Sequelize.INTEGER,
    },
    twitter: {
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
    tableName: "ntmc_onair_mediasosial",
    modelName: "ntmc_onair_mediasosial",
    sequelize: db,
  }
);

(async () => {
  Ntmc_onair_mediasosial.sync({ alter: true });
})();
module.exports = Ntmc_onair_mediasosial;
