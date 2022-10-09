const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const CategoryFasum = require("./category_fasum");

const Model = Sequelize.Model;

class Fasum extends Model {}
Fasum.init(
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
    fasum_type: {
      type: Sequelize.INTEGER,
    },
    fasum_name: {
      type: Sequelize.STRING(255),
    },
    fasum_logo: {
      type: Sequelize.TEXT,
    },
    fasum_address: {
      type: Sequelize.TEXT,
    },
    fasum_phone: {
      type: Sequelize.STRING(255),
    },
    fasum_lat: {
      type: Sequelize.TEXT,
    },
    fasum_lng: {
      type: Sequelize.TEXT,
    },
    fasum_description: {
      type: Sequelize.TEXT,
    },
    fasum_open_time: {
      type: Sequelize.TIME,
    },
    fasum_close_time: {
      type: Sequelize.TIME,
    },
    fasum_status: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: { where: Sequelize.literal("fasum.deleted_at is null") },
    scopes: {
      deleted: {
        where: Sequelize.literal("fasum.deleted_at is null"),
      },
    },
    // indexes: [{ fields: ["role_id"] }],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "fasum",
    modelName: "fasum",
    sequelize: db,
  }
);
Fasum.hasOne(CategoryFasum, {
  foreignKey: "id",
  sourceKey: "fasum_type",
});
(async () => {
  Fasum.sync({ alter: true });
})();
module.exports = Fasum;
