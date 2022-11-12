const Sequelize = require("sequelize");
const db = require("../../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../../constanta/db_structure");
const { AESEncrypt } = require("../../lib/encryption");
const Model = Sequelize.Model;

class Daftar_peserta extends Model {}
Daftar_peserta.init(
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
    title: {
      type: Sequelize.TEXT,
    },

    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    // indexes: [{ fields: ["role_id"] }],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "daftar_peserta",
    modelName: "DaftarPeserta",
    sequelize: db,
  }
);
// User.hasOne(UserRole, { foreignKey: "id" });
(async () => {
  Daftar_peserta.sync({ alter: true }).catch((err) => {
    console.log({ err });
  });
})();
module.exports = Daftar_peserta;
