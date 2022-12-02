const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Count_sim_polda_day extends Model {}
Count_sim_polda_day.init(
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
    baru_a: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    baru_c: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    baru_d: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    perpanjangan_a: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    perpanjangan_au: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    perpanjangan_c: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    perpanjangan_c1: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    perpanjangan_c2: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    perpanjangan_d: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    perpanjangan_d1: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    perpanjangan_b1: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    perpanjangan_b1u: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    perpanjangan_b2: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    perpanjangan_b2u: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    peningkatan_au: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    peningkatan_b1: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    peningkatan_b1u: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    peningkatan_b2: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    peningkatan_b2u: {
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
    tableName: "count_sim_polda_day",
    modelName: "count_sim_polda_day",
    sequelize: db,
  }
);
(async () => {
  Count_sim_polda_day.sync({ alter: true });
})();
module.exports = Count_sim_polda_day;
