const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Officer = require("./officer");
const TrxAccountOfficer = require("./trx_account_officer");
const Account = require("./account");
const codeReport = require("../middleware/codeReport");
const Model = Sequelize.Model;

class Day_report extends Model {}
Day_report.init(
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
    t_officer_registered: {
      type: Sequelize.STRING(20),
    },
    t_officer_registered_car: {
      type: Sequelize.STRING(20),
    },
    t_officer_registered_bike: {
      type: Sequelize.STRING(20),
    },
    t_officer_registered_not_driving: {
      type: Sequelize.STRING(20),
    },

    t_officer_active: {
      type: Sequelize.STRING(20),
    },
    t_officer_active_car: {
      type: Sequelize.STRING(20),
    },
    t_officer_active_bike: {
      type: Sequelize.STRING(20),
    },
    t_officer_active_not_driving: {
      type: Sequelize.STRING(20),
    },

    t_report_kriminal: {
      type: Sequelize.STRING(20),
    },
    t_report_lalu_lintas: {
      type: Sequelize.STRING(20),
    },
    t_report_kemacetan: {
      type: Sequelize.STRING(20),
    },
    t_report_bencanaalam: {
      type: Sequelize.STRING(20),
    },
    t_report_pengaturan: {
      type: Sequelize.STRING(20),
    },
    t_report_pengawalan: {
      type: Sequelize.STRING(20),
    },
    t_report_lainnya: {
      type: Sequelize.STRING(20),
    },

    t_schedule_done: {
      type: Sequelize.STRING(20),
    },
    t_rengiat_done: {
      type: Sequelize.STRING(20),
    },
    t_rengiat_failed: {
      type: Sequelize.STRING(20),
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
    // indexes: [{ fields: ["role_id"] }],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "day_report",
    modelName: "day_report",
    sequelize: db,
  }
);

(async () => {
  Day_report.sync({ alter: true }).catch((err) => {
    console.log({ err });
  });
})();
module.exports = Day_report;
