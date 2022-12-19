const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Layanan_Stackholder extends Model {}
Layanan_Stackholder.init(
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
      type: Sequelize.STRING(100),
    },
    icon: {
      type: Sequelize.STRING(255),
    },
    url: {
      type: Sequelize.TEXT,
    },
    stackholder_id: {
      type: Sequelize.INTEGER,
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
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "layanan_stackholder",
    modelName: "layanan_stackholder",
    sequelize: db,
  }
);
(async () => {
  Layanan_Stackholder.sync({ alter: true });
})();
module.exports = Layanan_Stackholder;
