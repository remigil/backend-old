const Sequelize = require("sequelize");
const db = require("../config/database");

const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");

const Model = Sequelize.Model;

class ReportFinal extends Model {}
ReportFinal.init(
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
    lalu_lintas_1: {
      type: Sequelize.INTEGER,
    },
    lalu_lintas_2: {
      type: Sequelize.INTEGER,
    },
    lalu_lintas_3: {
      type: Sequelize.INTEGER,
    },
    lalu_lintas_4: {
      type: Sequelize.INTEGER,
    },
    media_penyuluhan_1: {
      type: Sequelize.INTEGER,
    },
    media_penyuluhan_2: {
      type: Sequelize.INTEGER,
    },
    media_penyuluhan_3: {
      type: Sequelize.INTEGER,
    },
    media_penyuluhan_4: {
      type: Sequelize.INTEGER,
    },
    kegiatan_lalin_1: {
      type: Sequelize.INTEGER,
    },
    kegiatan_lalin_2: {
      type: Sequelize.INTEGER,
    },
    kegiatan_lalin_3: {
      type: Sequelize.INTEGER,
    },
    kegiatan_lalin_4: {
      type: Sequelize.INTEGER,
    },
    jenis_etle_1: {
      type: Sequelize.INTEGER,
    },
    jenis_etle_2: {
      type: Sequelize.INTEGER,
    },
    jenis_etle_3: {
      type: Sequelize.INTEGER,
    },
    pelanggaran_roda_2_1: {
      type: Sequelize.INTEGER,
    },
    pelanggaran_roda_2_2: {
      type: Sequelize.INTEGER,
    },
    pelanggaran_roda_2_3: {
      type: Sequelize.INTEGER,
    },
    pelanggaran_roda_2_4: {
      type: Sequelize.INTEGER,
    },
    pelanggaran_roda_2_5: {
      type: Sequelize.INTEGER,
    },
    pelanggaran_roda_2_6: {
      type: Sequelize.INTEGER,
    },
    pelanggaran_roda_2_7: {
      type: Sequelize.INTEGER,
    },
    pelanggaran_roda_4_1: {
      type: Sequelize.INTEGER,
    },
    pelanggaran_roda_4_2: {
      type: Sequelize.INTEGER,
    },
    pelanggaran_roda_4_3: {
      type: Sequelize.INTEGER,
    },
    pelanggaran_roda_4_4: {
      type: Sequelize.INTEGER,
    },
    pelanggaran_roda_4_5: {
      type: Sequelize.INTEGER,
    },
    pelanggaran_roda_4_6: {
      type: Sequelize.INTEGER,
    },
    pelanggaran_roda_4_7: {
      type: Sequelize.INTEGER,
    },
    barang_bukti_1: {
      type: Sequelize.INTEGER,
    },
    barang_bukti_2: {
      type: Sequelize.INTEGER,
    },
    barang_bukti_3: {
      type: Sequelize.INTEGER,
    },
    ranmor_1: {
      type: Sequelize.INTEGER,
    },
    ranmor_2: {
      type: Sequelize.INTEGER,
    },
    ranmor_3: {
      type: Sequelize.INTEGER,
    },
    ranmor_4: {
      type: Sequelize.INTEGER,
    },
    ranmor_5: {
      type: Sequelize.INTEGER,
    },
    profesi_pelanggar_1: {
      type: Sequelize.INTEGER,
    },
    profesi_pelanggar_2: {
      type: Sequelize.INTEGER,
    },
    profesi_pelanggar_3: {
      type: Sequelize.INTEGER,
    },
    profesi_pelanggar_4: {
      type: Sequelize.INTEGER,
    },
    profesi_pelanggar_5: {
      type: Sequelize.INTEGER,
    },
    profesi_pelanggar_6: {
      type: Sequelize.INTEGER,
    },
    profesi_pelanggar_7: {
      type: Sequelize.INTEGER,
    },
    usia_pelanggaran_1: {
      type: Sequelize.INTEGER,
    },
    usia_pelanggaran_2: {
      type: Sequelize.INTEGER,
    },
    usia_pelanggaran_3: {
      type: Sequelize.INTEGER,
    },
    usia_pelanggaran_4: {
      type: Sequelize.INTEGER,
    },
    usia_pelanggaran_5: {
      type: Sequelize.INTEGER,
    },
    usia_pelanggaran_6: {
      type: Sequelize.INTEGER,
    },
    usia_pelanggaran_7: {
      type: Sequelize.INTEGER,
    },
    usia_pelanggaran_8: {
      type: Sequelize.INTEGER,
    },
    usia_pelanggaran_9: {
      type: Sequelize.INTEGER,
    },
    usia_pelanggaran_10: {
      type: Sequelize.INTEGER,
    },
    usia_pelanggaran_11: {
      type: Sequelize.INTEGER,
    },
    sim_pelanggar_1: {
      type: Sequelize.INTEGER,
    },
    sim_pelanggar_2: {
      type: Sequelize.INTEGER,
    },
    sim_pelanggar_3: {
      type: Sequelize.INTEGER,
    },
    sim_pelanggar_4: {
      type: Sequelize.INTEGER,
    },
    sim_pelanggar_5: {
      type: Sequelize.INTEGER,
    },
    sim_pelanggar_6: {
      type: Sequelize.INTEGER,
    },
    sim_pelanggar_7: {
      type: Sequelize.INTEGER,
    },
    sim_pelanggar_8: {
      type: Sequelize.INTEGER,
    },
    sim_pelanggar_9: {
      type: Sequelize.INTEGER,
    },
    sim_pelanggar_10: {
      type: Sequelize.INTEGER,
    },
    lokasi_pelanggar_1: {
      type: Sequelize.INTEGER,
    },
    lokasi_pelanggar_2: {
      type: Sequelize.INTEGER,
    },
    lokasi_pelanggar_3: {
      type: Sequelize.INTEGER,
    },
    jenis_jalan_1: {
      type: Sequelize.INTEGER,
    },
    jenis_jalan_2: {
      type: Sequelize.INTEGER,
    },
    jenis_jalan_3: {
      type: Sequelize.INTEGER,
    },
    jenis_jalan_4: {
      type: Sequelize.INTEGER,
    },
    kecelakaan_1: {
      type: Sequelize.INTEGER,
    },
    kecelakaan_2: {
      type: Sequelize.INTEGER,
    },
    kecelakaan_3: {
      type: Sequelize.INTEGER,
    },
    kecelakaan_4: {
      type: Sequelize.INTEGER,
    },
    kecelakaan_berd_usia_1: {
      type: Sequelize.INTEGER,
    },
    kecelakaan_berd_usia_2: {
      type: Sequelize.INTEGER,
    },
    kecelakaan_berd_usia_3: {
      type: Sequelize.INTEGER,
    },
    kecelakaan_berd_usia_4: {
      type: Sequelize.INTEGER,
    },
    kecelakaan_berd_usia_5: {
      type: Sequelize.INTEGER,
    },
    kecelakaan_berd_usia_6: {
      type: Sequelize.INTEGER,
    },
    kecelakaan_berd_usia_7: {
      type: Sequelize.INTEGER,
    },
    kecelakaan_berd_usia_8: {
      type: Sequelize.INTEGER,
    },
    kecelakaan_berd_usia_9: {
      type: Sequelize.INTEGER,
    },
    kecelakaan_berd_usia_10: {
      type: Sequelize.INTEGER,
    },
    kecelakaan_berd_usia_11: {
      type: Sequelize.INTEGER,
    },
    profesi_korban_1: {
      type: Sequelize.INTEGER,
    },
    profesi_korban_2: {
      type: Sequelize.INTEGER,
    },
    profesi_korban_3: {
      type: Sequelize.INTEGER,
    },
    profesi_korban_4: {
      type: Sequelize.INTEGER,
    },
    profesi_korban_5: {
      type: Sequelize.INTEGER,
    },
    profesi_korban_6: {
      type: Sequelize.INTEGER,
    },
    profesi_korban_7: {
      type: Sequelize.INTEGER,
    },
    kecelakaan_berd_pendidikan_1: {
      type: Sequelize.INTEGER,
    },
    kecelakaan_berd_pendidikan_2: {
      type: Sequelize.INTEGER,
    },
    kecelakaan_berd_pendidikan_3: {
      type: Sequelize.INTEGER,
    },
    kecelakaan_berd_pendidikan_4: {
      type: Sequelize.INTEGER,
    },
    kecelakaan_berd_pendidikan_5: {
      type: Sequelize.INTEGER,
    },
    kecelakaan_berd_pendidikan_6: {
      type: Sequelize.INTEGER,
    },
    kecelakaan_berd_pendidikan_7: {
      type: Sequelize.INTEGER,
    },
    kecelakaan_berd_kendaraan_1: {
      type: Sequelize.INTEGER,
    },
    kecelakaan_berd_kendaraan_2: {
      type: Sequelize.INTEGER,
    },
    kecelakaan_berd_kendaraan_3: {
      type: Sequelize.INTEGER,
    },
    kecelakaan_berd_kendaraan_4: {
      type: Sequelize.INTEGER,
    },
    kecelakaan_berd_kendaraan_5: {
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
    // indexes: [{ fields: ["role_id"] }],
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "report_daily",
    modelName: "reportDaily",
    sequelize: db,
  }
);
(async () => {
  ReportFinal.sync({ alter: true }).catch((err) => {
    console.log({ err });
  });
})();
module.exports = ReportFinal;
