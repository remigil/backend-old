const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Polda = require("./polda");
const Polres = require("./polres");
const Model = Sequelize.Model;

class OperationProfile extends Model {}
OperationProfile.init(
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
    banner: {
      type: Sequelize.TEXT,
    },
    name_operation: {
      type: Sequelize.STRING(255),
    },
    document_sprint: {
      type: Sequelize.TEXT,
    },
    background_image: {
      type: Sequelize.TEXT,
    },
    logo: {
      type: Sequelize.TEXT,
    },
    date_start_operation: {
      type: Sequelize.DATEONLY,
    },
    date_end_operation: {
      type: Sequelize.DATEONLY,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: Sequelize.literal("operation_profile.deleted_at is null"),
    },
    scopes: {
      deleted: {
        where: Sequelize.literal("operation_profile.deleted_at is null"),
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "operation_profile",
    modelName: "operation_profile",
    sequelize: db,
  }
);
OperationProfile.belongsToMany(Polda, {
  as: "polda",
  through: "operation_profile_polda",
  foreignKey: "operation_profile_id", // replaces `productId`
  otherKey: "polda_id", // replaces `categoryId`
});

OperationProfile.belongsToMany(Polres, {
  as: "polres",
  through: "operation_profile_polres",
  foreignKey: "operation_profile_id", // replaces `productId`
  otherKey: "polres_id", // replaces `categoryId`
});
(async () => {
  OperationProfile.sync({ alter: true });
})();
module.exports = OperationProfile;
