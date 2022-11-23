const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Link extends Model {}
Link.init(
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
      type: Sequelize.STRING,
    },
    is_header: {
      type: Sequelize.BOOLEAN,
    },
    is_modal: {
      type: Sequelize.BOOLEAN,
    },
    parent_id: {
      type: Sequelize.INTEGER,
    },
    url: {
      type: Sequelize.TEXT,
    },
    icon: {
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
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "link",
    modelName: "link",
    sequelize: db,
  }
);

(async () => {
  Link.sync({ alter: true });
})();

module.exports = Link;
