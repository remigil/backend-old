const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Schedule = require("./schedule");
const Account = require("./account");
const Vip = require("./vip");

const Model = Sequelize.Model;

class Renpam extends Model {}
Renpam.init(
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
    operation_id: {
      type: Sequelize.INTEGER,
    },
    schedule_id: {
      type: Sequelize.INTEGER,
    },
    name_renpam: {
      type: Sequelize.STRING(50),
    },
    type_renpam: {
      // type [1: patroli, 2: pengawalan, 3: penjagaan, 4:]
      type: Sequelize.INTEGER,
    },
    title_start: {
      type: Sequelize.TEXT,
    },
    title_end: {
      type: Sequelize.TEXT,
    },
    route: {
      type: Sequelize.JSON,
    },
    route_alternatif_1: {
      type: Sequelize.JSON,
    },
    route_alternatif_2: {
      type: Sequelize.JSON,
    },
    coordinate_guarding: {
      type: Sequelize.JSON,
    },
    end_coordinate_renpam: {
      type: Sequelize.JSON,
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    start_time: {
      type: Sequelize.TIME,
    },
    end_time: {
      type: Sequelize.TIME,
    },
    status_renpam: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: { where: Sequelize.literal("renpams.deleted_at is null") },
    scopes: {
      deleted: {
        where: Sequelize.literal("renpams.deleted_at is null"),
      },
    },
    indexes: [{ fields: ["schedule_id"] }],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "renpam",
    modelName: "renpams",
    sequelize: db,
  }
);
Renpam.belongsToMany(Account, {
  as: "accounts",
  through: "renpam_account",
  foreignKey: "renpam_id",
  otherKey: "account_id",
});
Renpam.belongsToMany(Vip, {
  as: "vips",
  through: "renpam_vip",
  foreignKey: "renpam_id",
  otherKey: "vip_id",
});
(async () => {
  Renpam.sync({ alter: true });
})();
module.exports = Renpam;
