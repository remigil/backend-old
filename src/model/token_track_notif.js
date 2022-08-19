const Sequelize = require("sequelize");
const db = require("../config/database");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class TokenTrackNotif extends Model {}
TokenTrackNotif.init(
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
    nrp_user: {
      type: Sequelize.TEXT,
    },
    token_fcm: {
      type: Sequelize.TEXT,
    },
    token_track: {
      type: Sequelize.TEXT,
    },
    team_id: {
      type: Sequelize.INTEGER,
      // allowNull: false,
    },
    device_user: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: Sequelize.literal("token_track.deleted_at is null"),
    },
    scopes: {
      deleted: {
        where: Sequelize.literal("token_track.deleted_at is null"),
      },
    },
    indexes: [{ fields: ["team_id"] }],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "token_track",
    modelName: "token_track",
    sequelize: db,
  }
);
// User.hasOne(UserRole, { foreignKey: "id" });
(async () => {
  TokenTrackNotif.sync({ alter: true });
})();
module.exports = TokenTrackNotif;
