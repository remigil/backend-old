const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Count_day_polda_laka_langar extends Model {}
Count_day_polda_laka_langar.init(
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
    polda_id: {
      type: Sequelize.INTEGER,
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    capture_camera: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    validasi_petugas: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    konfirmasi_masyarakat: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    odol: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    tableName: "count_day_polda_laka_langgar",
    modelName: "count_day_polda_laka_langgar",
    sequelize: db,
  }
);

module.exports = Count_day_polda_laka_langar;
