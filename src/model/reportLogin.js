const Sequelize = require("sequelize");
const db = require("../config/database");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class ReportLogin extends Model {}
ReportLogin.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      //   get() {
      //     return AESEncrypt(String(this.getDataValue("id")), {
      //       isSafeUrl: true,
      //     });
      //   },
    },
    nrp_user: {
      type: Sequelize.STRING(255),
    },
    login_time: {
      type: Sequelize.DATE,
    },
    logout_time: {
      type: Sequelize.DATE,
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
    tableName: "report_login",
    modelName: "ReportLogin",
    sequelize: db,
  }
);

(async () => {
  ReportLogin.sync({ alter: true }).catch((err) => {
    console.log({ err });
  });
})();
module.exports = ReportLogin;
