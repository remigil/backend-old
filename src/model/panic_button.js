const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class CategoryFasum extends Model {}
CategoryFasum.init(
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
    subject: {
      type: Sequelize.STRING(255),
    },
    categori: {
      type: Sequelize.INTEGER,
    },
    status: {
      type: Sequelize.INTEGER,
    },
    coordinate: {
      type: Sequelize.JSON,
    },
    description: {
      type: Sequelize.TEXT,
    },

    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: Sequelize.literal("category_fasum.deleted_at is null"),
    },
    scopes: {
      deleted: {
        where: Sequelize.literal("category_fasum.deleted_at is null"),
      },
    },
    // indexes: [{ fields: ["role_id"] }],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "category_fasum",
    modelName: "category_fasum",
    sequelize: db,
  }
);
(async () => {
  CategoryFasum.sync({ alter: true });
})();
module.exports = CategoryFasum;
