const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Count_lapMasyarakat_polda_day extends Model {}
Count_lapMasyarakat_polda_day.init(
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
    tegur_prokes: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    masker: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    sosial_prokes: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    baksos: {
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
    tableName: "count_lapMasyarakat_polda_day",
    modelName: "count_lapMasyarakat_polda_day",
    sequelize: db,
  }
);
(async () => {
  Count_lapMasyarakat_polda_day.sync({ alter: true });
})();
module.exports = Count_lapMasyarakat_polda_day;
