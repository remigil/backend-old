const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Sim_keliling extends Model {}
Sim_keliling.init(
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
    name_sim_keliling: {
      type: Sequelize.STRING(255),
    },
    address: {
      type: Sequelize.STRING(255),
    },
    latitude: {
      type: Sequelize.TEXT,
    },
    longitude: {
      type: Sequelize.TEXT,
    },
    sim_keliling_open_time: {
      type: Sequelize.TEXT,
    },
    sim_keliling_close_time: {
      type: Sequelize.TEXT,
    },

    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: Sequelize.literal("sim_keliling.deleted_at is null"),
    },
    scopes: {
      deleted: {
        where: Sequelize.literal("sim_keliling.deleted_at is null"),
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "sim_keliling",
    modelName: "sim_keliling",
    sequelize: db,
  }
);
(async () => {
  Sim_keliling.sync({ alter: true });
})();
module.exports = Sim_keliling;
