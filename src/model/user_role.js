const Sequelize = require("sequelize");
const { StructureTimestamp } = require("../constanta/db_structure");
const db = require("../config/database");
const { AESEncrypt } = require("../lib/encryption");

class UserRole extends Sequelize.Model {}
UserRole.init(
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
    name: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    ...StructureTimestamp,
  },
  {
    paranoid: true,
    defaultScope: { where: Sequelize.literal("user_role.deleted_at is null") },
    scopes: {
      deleted: {
        where: Sequelize.literal("user_role.deleted_at is null"),
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "user_role",
    modelName: "user_role",
    sequelize: db,
  }
);

(async () => {
  UserRole.sync({ alter: true });
})();

module.exports = UserRole;
