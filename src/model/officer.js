const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Officer extends Model {}
Officer.init(
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
      where: Sequelize.literal("officer.deleted_at is null"),
    },
    scopes: {
      deleted: {
        where: Sequelize.literal("officer.deleted_at is null"),
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "officer",
    modelName: "officer",
    sequelize: db,
  }
);
(async () => {
  Officer.sync({ alter: true });
})();
module.exports = Officer;
