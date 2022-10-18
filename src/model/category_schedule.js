const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class CategorySchedule extends Model {}
CategorySchedule.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      // get() {
      //   return AESEncrypt(String(this.getDataValue("id")), {
      //     isSafeUrl: true,
      //   });
      // },
    },
    name_category_schedule: {
      type: Sequelize.STRING(255),
    },
    description_category_schedule: {
      type: Sequelize.TEXT,
    },
    status_category_schedule: {
      type: Sequelize.INTEGER,
    },
    order_category_schedule: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: Sequelize.literal("category_schedule.deleted_at is null"),
    },
    scopes: {
      deleted: {
        where: Sequelize.literal("category_schedule.deleted_at is null"),
      },
    },
    // indexes: [{ fields: ["role_id"] }],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "category_schedule",
    modelName: "category_schedule",
    sequelize: db,
  }
);
(async () => {
  CategorySchedule.sync({ alter: true }).catch((err) => {
    console.log({ err });
  });
})();
module.exports = CategorySchedule;
