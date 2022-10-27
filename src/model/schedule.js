const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Renpam = require("./renpam");
const CategorySchedule = require("./category_schedule");

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
    operation_id: {
      type: Sequelize.INTEGER,
    },
    activity: {
      type: Sequelize.STRING(255),
    },
    photo_schedule: {
      type: Sequelize.TEXT,
    },
    date_schedule: {
      type: Sequelize.DATEONLY,
    },
    id_category_schedule: {
      type: Sequelize.INTEGER,
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
    file_schedule: {
      type: Sequelize.TEXT,
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
    // indexes: [{ fields: ["role_id"] }],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "schedule",
    modelName: "schedule",
    sequelize: db,
  }
);

Schedule.hasOne(CategorySchedule, {
  foreignKey: "id",
  as: "category_schedule",
  sourceKey: "id_category_schedule",
});
Schedule.hasMany(Renpam, {
  foreignKey: "schedule_id",
  sourceKey: "id",
  as: "renpams",
});
(async () => {
  Schedule.sync({ alter: true }).catch((err) => {
    console.log({ err });
  });
})();
module.exports = Schedule;
