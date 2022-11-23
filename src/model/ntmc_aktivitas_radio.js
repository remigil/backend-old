const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Ntmc_aktivitas_radio extends Model {}
Ntmc_aktivitas_radio.init(
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
    gen_fm: {
      type: Sequelize.INTEGER,
    },
    jak_fm: {
      type: Sequelize.INTEGER,
    },
    most_fm: {
      type: Sequelize.INTEGER,
    },
    kiss_fm: {
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
    tableName: "ntmc_aktivitas_radio",
    modelName: "ntmc_aktivitas_radio",
    sequelize: db,
  }
);

(async () => {
  Ntmc_aktivitas_radio.sync({ alter: true });
})();
module.exports = Ntmc_aktivitas_radio;
