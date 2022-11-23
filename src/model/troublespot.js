const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;
const Polres = require("./polres");
const Polda = require("./polda");

class Troublespot extends Model {}
Troublespot.init(
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
    no_ts: {
      type: Sequelize.STRING(255),
    },
    report_date: {
      type: Sequelize.DATE,
    },
    reporter_name: {
      type: Sequelize.STRING(255),
    },
    polda_id: {
      type: Sequelize.INTEGER,
      // allowNull: false,
    },
    polres_id: {
      type: Sequelize.INTEGER,
      // allowNull: false,
    },
    traffic_reason: {
      type: Sequelize.TEXT,
    },
    location: {
      type: Sequelize.TEXT,
    },
    latitude: {
      type: Sequelize.TEXT,
    },
    longitude: {
      type: Sequelize.TEXT,
    },
    desc: {
      type: Sequelize.TEXT,
    },
    problem: {
      type: Sequelize.TEXT,
    },
    recommendation: {
      type: Sequelize.TEXT,
    },
    action: {
      type: Sequelize.TEXT,
    },
    result: {
      type: Sequelize.TEXT,
    },

    ...StructureTimestamp,
  },
  {
    defaultScope: { where: {
      deleted_at: null
    } },
    scopes: {
      deleted: {
        where: {
          deleted_at: null
        },
      },
    },
    indexes: [{fields: ["polda_id","polres_id"]}],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "troublespot",
    modelName: "troublespots",
    sequelize: db,
  }
);
  Troublespot.hasOne(Polres, {
    foreignKey:"id",
    sourceKey:"polres_id",
  });

  Troublespot.hasOne(Polda, {
    foreignKey:"id",
    sourceKey:"polda_id",
  });

(async () => {
  Troublespot.sync({ alter: true });
})();
module.exports = Troublespot;
