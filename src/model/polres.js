const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Account = require("./account");
const Model = Sequelize.Model;

class Polres extends Model {}
Polres.init(
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
    polda_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    code_satpas: {
      type: Sequelize.STRING(5),
    },
    name_polres: {
      type: Sequelize.STRING(200),
    },
    address: {
      type: Sequelize.TEXT,
    },
    latitude: {
      type: Sequelize.TEXT,
    },
    longitude: {
      type: Sequelize.TEXT,
    },

    ...StructureTimestamp,
  },
  {
    indexes: [{ fields: ["polda_id"] }],
    defaultScope: { where: Sequelize.literal("polres.deleted_at is null") },
    scopes: {
      deleted: {
        where: Sequelize.literal("polres.deleted_at is null"),
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "polres",
    modelName: "polres",
    sequelize: db,
  }
);
// Polres.hasMany(Account, { foreignKey: "id" });
(async () => {
  Polres.sync({ alter: true });
})();
module.exports = Polres;
