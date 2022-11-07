const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class TrxHt extends Model {}
TrxHt.init(
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
    no_lambung: {
      type: Sequelize.TEXT,
    },
    identitas_rt: {
      type: Sequelize.TEXT,
    },
    dari_pukul: {
      type: Sequelize.TEXT,
    },
    tujuan_pukul: {
      type: Sequelize.TEXT,
    },
    jumlah_kendaraan: {
      type: Sequelize.TEXT,
    },
    ket: {
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
    tableName: "trx_ht",
    modelName: "trxHt",
    sequelize: db,
  }
);
// User.hasOne(UserRole, { foreignKey: "id" });
(async () => {
  TrxHt.sync({ alter: true }).catch((err) => {
    console.log({ err });
  });
})();
module.exports = TrxHt;
