const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const CategoryNews = require("./category_news");
const Model = Sequelize.Model;

class News extends Model {}
News.init(
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
    news_category: {
      type: Sequelize.INTEGER,
    },
    sub_new_category: {
      type: Sequelize.INTEGER,
    },
    title: {
      type: Sequelize.TEXT,
    },
    content: {
      type: Sequelize.TEXT,
    },
    picture: {
      type: Sequelize.TEXT,
    },
    author: {
      type: Sequelize.TEXT,
    },
    link: {
      type: Sequelize.TEXT,
    },
    date: {
      type: Sequelize.STRING(30),
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
    tableName: "news",
    modelName: "newss",
    sequelize: db,
  }
);

News.hasMany(CategoryNews, {
  foreignKey: "id",
  sourceKey: "news_category",
});
(async () => {
  News.sync({ alter: true });
})();
module.exports = News;
