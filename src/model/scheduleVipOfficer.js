const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");

const Model = Sequelize.Model;

class ScheduleVipOfficer extends Model {}
ScheduleVipOfficer.init(
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
    vip_id: {
      type: Sequelize.INTEGER,
    },
    schedule_id: {
      type: Sequelize.INTEGER,
    },
    officer_id: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: Sequelize.literal("schedulevip.deleted_at is null"),
    },
    scopes: {
      deleted: {
        where: Sequelize.literal("schedulevip.deleted_at is null"),
      },
    },
    // indexes: [{ fields: ["role_id"] }],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "schedule_vipofficer",
    modelName: "schedulevip",
    sequelize: db,
  }
);
// ScheduleVipOfficer.belongsTo(Schedule, {
//   foreignKey: "id",
// });
(async () => {
  ScheduleVipOfficer.sync({ alter: true });
})();
module.exports = ScheduleVipOfficer;
