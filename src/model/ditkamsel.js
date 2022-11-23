const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Ditkamsel extends Model {}
Ditkamsel.init(
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
    polres_id: {
      type: Sequelize.INTEGER,
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    category: {
      type: Sequelize.INTEGER,
    },
    media_cetak: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    media_elektronik: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    media_sosial: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    laka_langgar: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    spanduk: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    leaflet: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    stiker: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    billboard: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: Sequelize.literal("ditkamsel.deleted_at is null"),
    },
    scopes: {
      deleted: {
        where: Sequelize.literal("ditkamsel.deleted_at is null"),
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "ditkamsel",
    modelName: "ditkamsel",
    sequelize: db,
  }
);
(async () => {
  Ditkamsel.sync({ alter: true });
})();
module.exports = Ditkamsel;
