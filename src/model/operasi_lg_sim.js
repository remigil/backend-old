const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Operasi_lg_sim extends Model {}
Operasi_lg_sim.init(
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
    operasi_id: {
      type: Sequelize.INTEGER,
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    sim_a: {
      type: Sequelize.INTEGER,
    },
    sim_a_umum: {
      type: Sequelize.INTEGER,
    },
    sim_b: {
      type: Sequelize.INTEGER,
    },
    sim_b_satu_umum: {
      type: Sequelize.INTEGER,
    },
    sim_b_dua_umum: {
      type: Sequelize.INTEGER,
    },
    sim_c: {
      type: Sequelize.INTEGER,
    },
    sim_d: {
      type: Sequelize.INTEGER,
    },
    sim_internasional: {
      type: Sequelize.INTEGER,
    },
    tanpa_sim: {
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
    tableName: "operasi_lg_sim",
    modelName: "operasi_lg_sim",
    sequelize: db,
  }
);

(async () => {
  Operasi_lg_sim.sync({ alter: true });
})();
module.exports = Operasi_lg_sim;
