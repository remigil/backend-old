const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Polda = require("../model/polda");
const Model = Sequelize.Model;

class Count_tckb_polda_day extends Model {}
Count_tckb_polda_day.init(
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
    tckb: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: true,
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
    tableName: "count_tckb_polda_day",
    modelName: "count_tckb_polda_day",
    sequelize: db,
  }
);
Polda.hasMany(Count_tckb_polda_day, { foreignKey: "polda_id", as: "tckb" });
(async () => {
  Count_tckb_polda_day.sync({ alter: true });
})();
module.exports = Count_tckb_polda_day;
