const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Position extends Model {}
Position.init(
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
    name_position: {
      type: Sequelize.STRING(255),
    },
    status_position: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: { where: Sequelize.literal("position.deleted_at is null") },
    scopes: {
      deleted: {
        where: Sequelize.literal("position.deleted_at is null"),
      },
    },
    // indexes: [{ fields: ["role_id"] }],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "position",
    modelName: "position",
    sequelize: db,
  }
);
// User.hasOne(UserRole, { foreignKey: "id" });
(async () => {
  Position.sync({ alter: true }).catch((err) => {
    console.log({ err });
  });
})();
module.exports = Position;
