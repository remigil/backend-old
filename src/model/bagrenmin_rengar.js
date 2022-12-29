const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Model = Sequelize.Model;

class Count_rencana_anggaran_day extends Model {}
Count_rencana_anggaran_day.init(
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
    program_kegiatan: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    belanja_barang: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    belanja_modal: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    gaji_pegawai: {
      type: Sequelize.INTEGER,
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
    tableName: "count_rencana_anggaran_day",
    modelName: "count_rencana_anggaran_day",
    sequelize: db,
  }
);
(async () => {
  Count_rencana_anggaran_day.sync({ alter: true });
})();
module.exports = Count_rencana_anggaran_day;
