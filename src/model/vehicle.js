const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure"); 
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Vehicle extends Model {}
Vehicle.init(
  {
    id_vehicle: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id_vehicle")), {
          isSafeUrl: true,
        });
      },
    },
    no_vehicle: {
      type: Sequelize.STRING(100),
    },
    type_vehicle: {
      type: Sequelize.STRING(255),
    },
    brand_vehicle: {
      type: Sequelize.STRING(255),
    },  
    ownership_vehicle: {
      type: Sequelize.STRING(255),
    }, 
    ...StructureTimestamp,
  },
  {
    defaultScope: { where: Sequelize.literal("vehicle.deleted_at is null") },
    scopes: {
      deleted: {
        where: Sequelize.literal("vehicle.deleted_at is null"),
      },
    },
    // indexes: [{ fields: ["role_id"] }],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "vehicle",
    modelName: "vehicle",
    sequelize: db,
  }
);
// User.hasOne(UserRole, { foreignKey: "id" });
(async () => {
  Vehicle.sync({ alter: true });
})();
module.exports = Vehicle;
