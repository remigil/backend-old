const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Polda extends Model {}
Polda.init(
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
    name_polda: {
      type: Sequelize.STRING(255),
    },

    ...StructureTimestamp,
  },
  {
    defaultScope: { where: Sequelize.literal("polda.deleted_at is null") },
    scopes: {
      deleted: {
        where: Sequelize.literal("polda.deleted_at is null"),
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "polda",
    modelName: "polda",
    sequelize: db,
  }
);
(async () => {
  Polda.sync({ alter: false });
})();
module.exports = Polda;
