const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Passenger_trip_on extends Model {}
Passenger_trip_on.init(
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
    trip_on_id: {
      type: Sequelize.INTEGER,
    },
    nationality: {
      type: Sequelize.STRING(255),
    },
    name: {
      type: Sequelize.STRING(255),
    },
    nik: {
      type: Sequelize.STRING(255),
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
    indexes: [{ fields: ["trip_on_id"] }],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "passenger_trip_on",
    modelName: "passenger_trip_on",
    sequelize: db,
  }
);


(async () => {
  Passenger_trip_on.sync({ alter: true });
})();
module.exports = Passenger_trip_on;
