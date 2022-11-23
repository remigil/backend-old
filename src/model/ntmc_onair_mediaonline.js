const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Ntmc_onair_mediaonline extends Model {}
Ntmc_onair_mediaonline.init(
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
    web_ntmc: {
      type: Sequelize.INTEGER,
    },
    web_korlantas: {
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
    tableName: "ntmc_onair_mediaonline",
    modelName: "ntmc_onair_mediaonline",
    sequelize: db,
  }
);

(async () => {
  Ntmc_onair_mediaonline.sync({ alter: true });
})();
module.exports = Ntmc_onair_mediaonline;
