const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Count_sdm_polantas_day extends Model {}
Count_sdm_polantas_day.init(
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
    irjen: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    brigjen: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    kbp: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    akbp: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    kp: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    akp: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    iptu: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    ipda: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    aiptu: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    aipda: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    bripka: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    brigdr: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    briptu: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    bripda: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    pns: {
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
    tableName: "count_sdm_polantas_day",
    modelName: "count_sdm_polantas_day",
    sequelize: db,
  }
);
(async () => {
  Count_sdm_polantas_day.sync({ alter: true });
})();
module.exports = Count_sdm_polantas_day;
