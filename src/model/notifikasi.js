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
    operation_id: {
      type: Sequelize.INTEGER,
    },
    name_officer: {
      type: Sequelize.STRING(255),
    },
    photo_officer: {
      type: Sequelize.TEXT,
    },
    nrp_officer: {
      type: Sequelize.STRING(255),
    },
    rank_officer: {
      type: Sequelize.STRING(255),
    },
    structural_officer: {
      type: Sequelize.STRING(255),
    },
    pam_officer: {
      type: Sequelize.STRING(255),
    },
    phone_officer: {
      type: Sequelize.STRING(50),
    },
    status_officer: {
      type: Sequelize.INTEGER,
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    polres_id: {
      type: Sequelize.INTEGER,
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
  Notification.sync({ alter: true });
})();
module.exports = Notification;
