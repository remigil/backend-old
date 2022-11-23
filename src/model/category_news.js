const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class CategoryNews extends Model {}
CategoryNews.init(
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
    name_category_news: {
      type: Sequelize.STRING(255),
    },
    description_category_news: {
      type: Sequelize.TEXT,
    },
    // status_category_fasum: {
    //   type: Sequelize.INTEGER,
    // },
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
    tableName: "category_news",
    modelName: "category_news",
    sequelize: db,
  }
);
(async () => {
  CategoryNews.sync({ alter: true });
})();
module.exports = CategoryNews;
