const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;
const Polres = require("./polres");
const Polda = require("./polda");

class Blankspot extends Model {}
Blankspot.init(
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
    route: {
      type: Sequelize.JSON,
    },
    direction_route: {
      type: Sequelize.JSON,
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
    indexes: [{ fields: ["polda_id", "polres_id"] }],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "blankspot",
    modelName: "blankspots",
    sequelize: db,
  }
);
Blankspot.hasOne(Polres, {
  foreignKey: "id",
  sourceKey: "polres_id",
});

Blankspot.hasOne(Polda, {
  foreignKey: "id",
  sourceKey: "polda_id",
});

(async () => {
  Blankspot.sync({ alter: true });
})();
module.exports = Blankspot;
