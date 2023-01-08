const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class satification_survey extends Model {}
satification_survey.init(
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
    name_survey: {
      type: Sequelize.STRING(255),
    },
    address_survey: {
      type: Sequelize.STRING(255),
    },
    email_survey: {
      type: Sequelize.STRING(255),
    },
    design_survey: {
      type: Sequelize.INTEGER,
    },
    convenience_survey: {
      type: Sequelize.INTEGER,
    },
    accurate_survey: {
      type: Sequelize.INTEGER,
    },
    fast_survey: {
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
    tableName: "satification_survey",
    modelName: "satification_survey",
    sequelize: db,
  }
);
// (async () => {
//   satification_survey.sync({ alter: true });
// })();
module.exports = satification_survey;
