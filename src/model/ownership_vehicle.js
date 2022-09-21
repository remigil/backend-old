const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class OwnershipVehicle extends Model {}
OwnershipVehicle.init(
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
    name_ownershipVehicle: {
      type: Sequelize.STRING(255),
    },
    status_ownershipVehicle: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: Sequelize.literal("ownership_vehicle.deleted_at is null"),
    },
    scopes: {
      deleted: {
        where: Sequelize.literal("ownership_vehicle.deleted_at is null"),
      },
    },
    // indexes: [{ fields: ["role_id"] }],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "ownership_vehicle",
    modelName: "ownership_vehicle",
    sequelize: db,
  }
);
// User.hasOne(UserRole, { foreignKey: "id" });
(async () => {
  OwnershipVehicle.sync({ alter: true });
})();
module.exports = OwnershipVehicle;
