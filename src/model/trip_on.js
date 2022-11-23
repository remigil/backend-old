const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Society = require("./society");
const Public_vehicle = require("./public_vehicle");
const Type_vehicle = require("./type_vehicle");
const Brand_vehicle = require("./brand_vehicle");
const Passenger_trip_on = require("./passenger_trip_on");
const Model = Sequelize.Model;

class Trip_on extends Model {}
Trip_on.init(
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
    code: {
      type: Sequelize.STRING(255),
    },
    user_id: {
      type: Sequelize.INTEGER,
    },
    vehicle_id: {
      type: Sequelize.INTEGER,
    },
    brand_id: {
      type: Sequelize.INTEGER,
    },
    type_id: {
      type: Sequelize.INTEGER,
    },
    distance: {
      type: Sequelize.STRING,
    },
    duration: {
      type: Sequelize.STRING,
    },
    departure_date: {
      type: Sequelize.DATEONLY,
    },
    departure_time: {
      type: Sequelize.TIME,
    },
    start_coordinate: {
      type: Sequelize.JSON,
    },
    end_coordinate: {
      type: Sequelize.JSON,
    },
    route: {
      type: Sequelize.JSON,
    },
    validity_period: {
      type: Sequelize.STRING,
    },
    district_start: {
      type: Sequelize.STRING,
    },
    province_start: {
      type: Sequelize.STRING,
    },
    district_end: {
      type: Sequelize.STRING,
    },
    province_end: {
      type: Sequelize.STRING,
    },
    barcode: {
      type: Sequelize.STRING,
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
    indexes: [{ fields: ["user_id", "vehicle_id", "type_id", "brand_id"] }],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "trip_on",
    modelName: "trip_on",
    sequelize: db,
  }
);
Trip_on.hasOne(Society, {
  foreignKey: "id",
  sourceKey: "user_id",
});
Trip_on.hasOne(Public_vehicle, {
  foreignKey: "id",
  sourceKey: "vehicle_id",
});
Trip_on.hasOne(Type_vehicle, {
  foreignKey: "id",
  sourceKey: "type_id",
});
Trip_on.hasOne(Brand_vehicle, {
  foreignKey: "id",
  sourceKey: "brand_id",
});
Trip_on.hasMany(Passenger_trip_on, { foreignKey: "trip_on_id" });

(async () => {
  Trip_on.sync({ alter: true });
})();
module.exports = Trip_on;
