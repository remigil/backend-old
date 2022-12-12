const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Count_stnk_polda_day extends Model {}
Count_stnk_polda_day.init(
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
    baru: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    perpanjangan: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    rubentina: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    bbn_1_r2: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    bbn_1_r4: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    perubahan_r2: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    perubahan_r4: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    perpanjangan_r2: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    perpanjangan_r4: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    mutasi_keluar_r2: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    mutasi_keluar_r4: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    mutasi_masuk_r2: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    mutasi_masuk_r4: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    pengesahan_r2: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    pengesahan_r4: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    samolnas_r2: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    samolnas_r4: {
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
    tableName: "count_stnk_polda_day",
    modelName: "count_stnk_polda_day",
    sequelize: db,
  }
);
(async () => {
  Count_stnk_polda_day.sync({ alter: true });
})();
module.exports = Count_stnk_polda_day;
