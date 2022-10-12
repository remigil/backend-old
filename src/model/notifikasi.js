const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Polda = require("./polda");
const Model = Sequelize.Model;

class Notification extends Model {}
Notification.init(
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
    type: {
      type: Sequelize.STRING(100),
      //panic button, laporan, instruksi
    },
    title: {
      type: Sequelize.STRING(255),
    },
    description: {
      type: Sequelize.TEXT,
    },
    is_read: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    officer_id: {
      type: Sequelize.INTEGER,
    },
    mobile: {
      type: Sequelize.TEXT,
    },
    web: {
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
    tableName: "notification",
    modelName: "notifications",
    sequelize: db,
  }
);

(async () => {
  Notification.sync({ alter: true }).catch((err) => {
    console.log({ err });
  });
})();
module.exports = Notification;
