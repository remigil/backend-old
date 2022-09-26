const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const UserRole = require("./user_role");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class User extends Model {}
User.init(
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
    operation_id: {
      type: Sequelize.INTEGER,
    },
    username: {
      type: Sequelize.TEXT,
    },
    password: {
      type: Sequelize.TEXT,
      set(value) {
        this.setDataValue(
          "password",
          bcrypt.hashSync(value, bcrypt.genSaltSync(10))
        );
      },
    },
    status_verifikasi: {
      type: Sequelize.INTEGER,
    },
    email: {
      type: Sequelize.TEXT,
    },
    role_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: { where: Sequelize.literal("users.deleted_at is null") },
    scopes: {
      deleted: {
        where: Sequelize.literal("users.deleted_at is null"),
      },
    },
    indexes: [{ fields: ["role_id"] }],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "user",
    modelName: "users",
    sequelize: db,
  }
);
User.hasOne(UserRole, {
  foreignKey: "id",
  as: "user_role",
  sourceKey: "role_id",
});
(async () => {
  User.sync({ alter: true });
})();
module.exports = User;
