const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Stackholder extends Model {}
Stackholder.init(
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
      type: Sequelize.TEXT,
    },
    url: {
      type: Sequelize.TEXT,
    },
    alamat: {
      type: Sequelize.TEXT,
    },
    no_telp: {
      type: Sequelize.TEXT,
    },
    call_center: {
      type: Sequelize.TEXT,
    },
    email: {
      type: Sequelize.TEXT,
    },
    fax: {
      type: Sequelize.TEXT,
    },
    facebook: {
      type: Sequelize.TEXT,
    },
    twitter: {
      type: Sequelize.TEXT,
    },
    instagram: {
      type: Sequelize.TEXT,
    },
    youtube: {
      type: Sequelize.TEXT,
    },
    latitude: {
      type: Sequelize.TEXT,
    },
    longitude: {
      type: Sequelize.TEXT,
    },
    link_playlist: {
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
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "stackholder",
    modelName: "stackholder",
    sequelize: db,
  }
);
(async () => {
  Stackholder.sync({ alter: true });
})();
module.exports = Stackholder;
