const Sequelize = require("sequelize");
const db = require("../config/database");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class AnevNews extends Model {}
AnevNews.init(
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
    title: {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    photo: {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    show_on_monthly: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    show_on_daily: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
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
    tableName: "anev_news",
    modelName: "anev_news",
    sequelize: db,
  }
);
(async () => {
  AnevNews.sync({ alter: true });
})();
module.exports = AnevNews;
