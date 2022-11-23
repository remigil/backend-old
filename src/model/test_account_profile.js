const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;
const Polda = require("./polda");
const Polres = require("./polres");

class Test_account_profile extends Model {}
Test_account_profile.init(
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
    name_account: {
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
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "test_account_profile",
    modelName: "test_account_profile",
    sequelize: db,
  }
);
Test_account_profile.belongsToMany(Polda, {
  as: "polda",
  through: "test_account_profile_polda",
  foreignKey: "test_account_id",
  otherKey: "polda_id"
});
// Test_account_profile.belongsToMany(Polda, {
//   as: "polda",
//   through: "test_account_profile_polda",
//   foreignKey: "test_account_id",
//   otherKey: "polda_id"
// });

(async () => {
  Test_account_profile.sync({ alter: true });
})();
module.exports = Test_account_profile;
