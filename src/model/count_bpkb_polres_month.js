const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Count_bpkb_polres_month extends Model {}
Count_bpkb_polres_month.init(
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
    polres_id: {
      type: Sequelize.INTEGER,
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    baru: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    perpanjangan: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    rubentina: {
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
    tableName: "count_bpkb_polres_month",
    modelName: "count_bpkb_polres_month",
    sequelize: db,
  }
);
(async () => {
  Count_bpkb_polres_month.sync({ alter: true });
})();
module.exports = Count_bpkb_polres_month;
