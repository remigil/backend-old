const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Test_account_user extends Model {}
Test_account_user.init(
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
    username: {
      type: Sequelize.STRING(255),
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
    test_account_profile_id: {
      type: Sequelize.INTEGER,
    },
    status_verifikasi: {
      type: Sequelize.INTEGER,
    },
    email: {
      type: Sequelize.TEXT,
    },
    role_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
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
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "test_account_user",
    modelName: "test_account_user",
    sequelize: db,
  }
);
(async () => {
  Test_account_user.sync({ alter: true });
})();
module.exports = Test_account_user;
