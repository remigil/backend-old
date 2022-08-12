const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const Model = Sequelize.Model;

class Users extends Model {}
Users.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nama: {
      type: Sequelize.STRING(100),
    },
    alamat: {
      type: Sequelize.TEXT,
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
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      allowNull: false,
    },
    updated_at: {
      type: "TIMESTAMP",
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      allowNull: true,
    },
    deleted_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    defaultScope: { where: Sequelize.literal("users.deleted_at is null") },
    scopes: {
      deleted: {
        where: Sequelize.literal("users.deleted_at is null"),
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "user",
    modelName: "users",
    sequelize: db,
  }
);
(async () => {
  Users.sync({ alter: true });
})();
module.exports = Users;
