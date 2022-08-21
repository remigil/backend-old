const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Schedule extends Model {}
Schedule.init(
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
    activity: {
      type: Sequelize.STRING(255),
    },
    id_vip: {
      type: Sequelize.TEXT,
    },
    id_account: {
      type: Sequelize.TEXT,
    },
    date_schedule: {
      type: Sequelize.DATE,
    },
    start_time: {
      type: Sequelize.TIME,
    },
    end_time: {
      type: Sequelize.TIME,
    },
    address_schedule: {
      type: Sequelize.TEXT,
    },
    coordinate_schedule: {
      type: Sequelize.TEXT,
    },
    status_schedule: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: { where: Sequelize.literal("schedule.deleted_at is null") },
    scopes: {
      deleted: {
        where: Sequelize.literal("schedule.deleted_at is null"),
      },
    },
    // indexes: [{ fields: ["role_id"] }],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "schedule",
    modelName: "schedule",
    sequelize: db,
  }
);
// User.hasOne(UserRole, { foreignKey: "id" });
(async () => {
  Schedule.sync({ alter: true });
})();
module.exports = Schedule;
