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
    code_satpas: {
      type: Sequelize.STRING(5),
    },
    name_polda: {
      type: Sequelize.STRING(255),
    },
    address: {
      type: Sequelize.TEXT,
    },
    logo_polda: {
      type: Sequelize.TEXT,
    },
    phone_polda: {
      type: Sequelize.STRING(50),
    },
    image: {
      type: Sequelize.STRING(200),
    },
    hotline: {
      type: Sequelize.STRING(20),
    },
    website: {
      type: Sequelize.TEXT,
    },
    latitude: {
      type: Sequelize.TEXT,
    },
    longitude: {
      type: Sequelize.TEXT,
    },
    zoomview: {
      type: Sequelize.TEXT,
    },
    file_shp: {
      type: Sequelize.TEXT,
    },
    open_time: {
      type: Sequelize.TIME,
    },
    close_time: {
      type: Sequelize.TIME,
    },
    urutan: {
      type: Sequelize.INTEGER,
    },
    facebook: {
      type: Sequelize.STRING(200),
    },
    instagram: {
      type: Sequelize.STRING(200),
    },
    twitter: {
      type: Sequelize.STRING(200),
    },
    youtube: {
      type: Sequelize.TEXT,
    },
    link_playlist: {
      type: Sequelize.TEXT,
    },
    link_cctv: {
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
    tableName: "polda",
    modelName: "polda",
    sequelize: db,
  }
);
// (async () => {
//   Polda.sync({ alter: true });
// })();
module.exports = Polda;
