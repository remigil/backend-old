const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const { Integer } = require("read-excel-file");
const Model = Sequelize.Model;

class Token extends Model {}
Token.init(
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

    token: {
      type: Sequelize.STRING(200),
    },
    token_created_date: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    token_expired_date: {
      type: Sequelize.DATE,
    },
    no_hp: {
      type: Sequelize.STRING(20),
    },
    typeToken: {
      type: Sequelize.INTEGER(),
    },

    ...StructureTimestamp,
  },
  {
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "token",
    modelName: "token",
    sequelize: db,
  }
);
(async () => {
  Token.sync({ alter: true });
})();
module.exports = Token;
