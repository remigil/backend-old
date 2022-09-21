const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Structural extends Model {}
Structural.init(
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
    name_structural: {
      type: Sequelize.STRING(255),
    },
    status_structural: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: { where: Sequelize.literal("structural.deleted_at is null") },
    scopes: {
      deleted: {
        where: Sequelize.literal("structural.deleted_at is null"),
      },
    },
    // indexes: [{ fields: ["role_id"] }],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "structural",
    modelName: "structural",
    sequelize: db,
  }
);
// User.hasOne(UserRole, { foreignKey: "id" });
(async () => {
  Structural.sync({ alter: true });
})();
module.exports = Structural;
