const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Ntmc_dok_medsos extends Model {}
Ntmc_dok_medsos.init(
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
    positif_korlantas: {
      type: Sequelize.INTEGER,
    },
    negatif_korlantas: {
      type: Sequelize.INTEGER,
    },
    lakalantas: {
      type: Sequelize.INTEGER,
    },
    positif_polri: {
      type: Sequelize.INTEGER,
    },
    negatif_polri: {
      type: Sequelize.INTEGER,
    },
    liputan: {
      type: Sequelize.INTEGER,
    },
    kategori: {
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
    tableName: "ntmc_dok_medsos",
    modelName: "ntmc_dok_medsos",
    sequelize: db,
  }
);

(async () => {
  Ntmc_dok_medsos.sync({ alter: true });
})();
module.exports = Ntmc_dok_medsos;
