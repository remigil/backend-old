const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Count_dikmaslantas_polda_month extends Model {}
Count_dikmaslantas_polda_month.init(
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
    polda_id: {
      type: Sequelize.INTEGER,
    },
    date: {
      type: Sequelize.DATEONLY,
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
    tableName: "count_dikmaslantas_polda_month",
    modelName: "count_dikmaslantas_polda_month",
    sequelize: db,
  }
);
(async () => {
  Count_dikmaslantas_polda_month.sync({ alter: true });
})();
module.exports = Count_dikmaslantas_polda_month;
