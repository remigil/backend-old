const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
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
    time_start_operation: {
      type: Sequelize.STRING(25),
    },
    time_end_operation: {
      type: Sequelize.STRING(25),
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
(async () => {
  OperationProfile.sync({ alter: true });
})();
module.exports = OperationProfile;
