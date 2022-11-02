const response = require("../lib/response");

const moment = require("moment");

const puppeteer = require("puppeteer");
const path = require("path");
const { AESDecrypt, AESEncrypt } = require("../lib/encryption");
const ReportFinal = require("../model/report_finally");
module.exports = class Anev {
  static daily = async (req, res) => {
    try {
      const { type, data } = req.query;
      // console.log(req);
      moment.locale("id");
      const date = moment().format("LL");
      switch (type) {
        case "view": {
          const datanya = AESDecrypt(data, {
            isSafeUrl: true,
            parseMode: "string",
          });
          req.body = JSON.parse(datanya);

          const insertDb = {
            title: req.body.title,
            lalu_lintas_1: req.body.lalu_lintas[0].angka || 0,
            lalu_lintas_2: req.body.lalu_lintas[1].angka || 0,
            lalu_lintas_3: req.body.lalu_lintas[2].angka || 0,
            lalu_lintas_4: req.body.lalu_lintas[3].angka || 0,
            media_penyuluhan_1: req.body.media_penyuluhan_1[0].angka || 0,
            media_penyuluhan_2: req.body.media_penyuluhan_1[1].angka || 0,
            media_penyuluhan_3: req.body.media_penyuluhan_1[2].angka || 0,
            media_penyuluhan_4: req.body.media_penyuluhan_1[3].angka || 0,
            kegiatan_lalin_1: req.body.kegiatan_lalu_lintas_1[0].angka || 0,
            kegiatan_lalin_2: req.body.kegiatan_lalu_lintas_1[1].angka || 0,
            kegiatan_lalin_3: req.body.kegiatan_lalu_lintas_1[2].angka || 0,
            kegiatan_lalin_4: req.body.kegiatan_lalu_lintas_1[3].angka || 0,
            jenis_etle_1: req.body.jenis_etle[0].angka || 0,
            jenis_etle_2: req.body.jenis_etle[1].angka || 0,
            jenis_etle_3: req.body.jenis_etle[2].angka || 0,
            pelanggaran_roda_2_1: req.body.pelanggaran_roda_2[0].angka || 0,
            pelanggaran_roda_2_2: req.body.pelanggaran_roda_2[1].angka || 0,
            pelanggaran_roda_2_3: req.body.pelanggaran_roda_2[2].angka || 0,
            pelanggaran_roda_2_4: req.body.pelanggaran_roda_2[3].angka || 0,
            pelanggaran_roda_2_5: req.body.pelanggaran_roda_2[4].angka || 0,
            pelanggaran_roda_2_6: req.body.pelanggaran_roda_2[5].angka || 0,
            pelanggaran_roda_2_7: req.body.pelanggaran_roda_2[6].angka || 0,
            pelanggaran_roda_4_1: req.body.pelanggaran_roda_4[0].angka || 0,
            pelanggaran_roda_4_2: req.body.pelanggaran_roda_4[1].angka || 0,
            pelanggaran_roda_4_3: req.body.pelanggaran_roda_4[2].angka || 0,
            pelanggaran_roda_4_4: req.body.pelanggaran_roda_4[3].angka || 0,
            pelanggaran_roda_4_5: req.body.pelanggaran_roda_4[4].angka || 0,
            pelanggaran_roda_4_6: req.body.pelanggaran_roda_4[5].angka || 0,
            pelanggaran_roda_4_7: req.body.pelanggaran_roda_4[6].angka || 0,
            barang_bukti_1: req.body.barang_bukti[0].angka || 0,
            barang_bukti_2: req.body.barang_bukti[1].angka || 0,
            barang_bukti_3: req.body.barang_bukti[2].angka || 0,
            ranmor_1: req.body.ranmor[0].angka || 0,
            ranmor_2: req.body.ranmor[1].angka || 0,
            ranmor_3: req.body.ranmor[2].angka || 0,
            ranmor_4: req.body.ranmor[3].angka || 0,
            ranmor_5: req.body.ranmor[4].angka || 0,
            profesi_pelanggar_1: req.body.profesi_pelanggar[0].angka || 0,
            profesi_pelanggar_2: req.body.profesi_pelanggar[1].angka || 0,
            profesi_pelanggar_3: req.body.profesi_pelanggar[2].angka || 0,
            profesi_pelanggar_4: req.body.profesi_pelanggar[3].angka || 0,
            profesi_pelanggar_5: req.body.profesi_pelanggar[4].angka || 0,
            profesi_pelanggar_6: req.body.profesi_pelanggar[5].angka || 0,
            profesi_pelanggar_7: req.body.profesi_pelanggar[6].angka || 0,
            usia_pelanggaran_1: req.body.usia_pelanggaran[0].angka || 0,
            usia_pelanggaran_2: req.body.usia_pelanggaran[1].angka || 0,
            usia_pelanggaran_3: req.body.usia_pelanggaran[2].angka || 0,
            usia_pelanggaran_4: req.body.usia_pelanggaran[3].angka || 0,
            usia_pelanggaran_5: req.body.usia_pelanggaran[4].angka || 0,
            usia_pelanggaran_6: req.body.usia_pelanggaran[5].angka || 0,
            usia_pelanggaran_7: req.body.usia_pelanggaran[6].angka || 0,
            usia_pelanggaran_8: req.body.usia_pelanggaran[7].angka || 0,
            usia_pelanggaran_9: req.body.usia_pelanggaran[8].angka || 0,
            usia_pelanggaran_10: req.body.usia_pelanggaran[9].angka || 0,
            usia_pelanggaran_11: req.body.usia_pelanggaran[10].angka || 0,
            sim_pelanggar_1: req.body.sim_pelanggar[0].angka || 0,
            sim_pelanggar_2: req.body.sim_pelanggar[1].angka || 0,
            sim_pelanggar_3: req.body.sim_pelanggar[2].angka || 0,
            sim_pelanggar_4: req.body.sim_pelanggar[3].angka || 0,
            sim_pelanggar_5: req.body.sim_pelanggar[4].angka || 0,
            sim_pelanggar_6: req.body.sim_pelanggar[5].angka || 0,
            sim_pelanggar_7: req.body.sim_pelanggar[6].angka || 0,
            sim_pelanggar_8: req.body.sim_pelanggar[7].angka || 0,
            sim_pelanggar_9: req.body.sim_pelanggar[8].angka || 0,
            sim_pelanggar_10: req.body.sim_pelanggar[9].angka || 0,
            lokasi_pelanggar_1: req.body.lokasi_pelanggar[0].angka || 0,
            lokasi_pelanggar_2: req.body.lokasi_pelanggar[1].angka || 0,
            lokasi_pelanggar_3: req.body.lokasi_pelanggar[2].angka || 0,
            lokasi_pelanggar_4: req.body.lokasi_pelanggar[3].angka || 0,
            jenis_jalan_1: req.body.jenis_jalan[0].angka || 0,
            jenis_jalan_2: req.body.jenis_jalan[1].angka || 0,
            jenis_jalan_3: req.body.jenis_jalan[2].angka || 0,
            jenis_jalan_4: req.body.jenis_jalan[3].angka || 0,
            kecelakaan_1: req.body.kecelakaan[0].angka || 0,
            kecelakaan_2: req.body.kecelakaan[1].angka || 0,
            kecelakaan_3: req.body.kecelakaan[2].angka || 0,
            kecelakaan_4: req.body.kecelakaan[3].angka || 0,
            kecelakaan_5: req.body.kecelakaan[4].angka || 0,
            kecelakaan_berd_usia_1: req.body.kecelakaan_berd_usia[0].angka || 0,
            kecelakaan_berd_usia_2: req.body.kecelakaan_berd_usia[1].angka || 0,
            kecelakaan_berd_usia_3: req.body.kecelakaan_berd_usia[2].angka || 0,
            kecelakaan_berd_usia_4: req.body.kecelakaan_berd_usia[3].angka || 0,
            kecelakaan_berd_usia_5: req.body.kecelakaan_berd_usia[4].angka || 0,
            kecelakaan_berd_usia_6: req.body.kecelakaan_berd_usia[5].angka || 0,
            kecelakaan_berd_usia_7: req.body.kecelakaan_berd_usia[6].angka || 0,
            kecelakaan_berd_usia_8: req.body.kecelakaan_berd_usia[7].angka || 0,
            kecelakaan_berd_usia_9: req.body.kecelakaan_berd_usia[8].angka || 0,
            kecelakaan_berd_usia_10:
              req.body.kecelakaan_berd_usia[9].angka || 0,
            kecelakaan_berd_usia_11:
              req.body.kecelakaan_berd_usia[10].angka || 0,
            profesi_korban_1: req.body.profesi_korban[0].angka || 0,
            profesi_korban_2: req.body.profesi_korban[1].angka || 0,
            profesi_korban_3: req.body.profesi_korban[2].angka || 0,
            profesi_korban_4: req.body.profesi_korban[3].angka || 0,
            profesi_korban_5: req.body.profesi_korban[4].angka || 0,
            profesi_korban_6: req.body.profesi_korban[5].angka || 0,
            profesi_korban_7: req.body.profesi_korban[6].angka || 0,
            kecelakaan_berd_pendidikan_1:
              req.body.kecelakaan_berd_pendidikan[0].angka || 0,
            kecelakaan_berd_pendidikan_2:
              req.body.kecelakaan_berd_pendidikan[1].angka || 0,
            kecelakaan_berd_pendidikan_3:
              req.body.kecelakaan_berd_pendidikan[2].angka || 0,
            kecelakaan_berd_pendidikan_4:
              req.body.kecelakaan_berd_pendidikan[3].angka || 0,
            kecelakaan_berd_pendidikan_5:
              req.body.kecelakaan_berd_pendidikan[4].angka || 0,
            kecelakaan_berd_pendidikan_6:
              req.body.kecelakaan_berd_pendidikan[5].angka || 0,
            kecelakaan_berd_pendidikan_7:
              req.body.kecelakaan_berd_pendidikan[6].angka || 0,
            kecelakaan_berd_kendaraan_1:
              req.body.kecelakaan_berd_kendaraan[0].angka || 0,
            kecelakaan_berd_kendaraan_2:
              req.body.kecelakaan_berd_kendaraan[1].angka || 0,
            kecelakaan_berd_kendaraan_3:
              req.body.kecelakaan_berd_kendaraan[2].angka || 0,
            kecelakaan_berd_kendaraan_4:
              req.body.kecelakaan_berd_kendaraan[3].angka || 0,
            kecelakaan_berd_kendaraan_5:
              req.body.kecelakaan_berd_kendaraan[4].angka || 0,
          };

          const listTableBab3 = {
            kegiatan_penyuluhan: [
              {
                id: 1,
                title: "MEDIA CETAK",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
              {
                id: 2,
                title: "MEDIA ELEKTRONIK",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
              {
                id: 3,
                title: "MEDIA SOSIAL",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
              { id: 4, title: "LAIN", h1: "", h1: "", angka: "", trend: "" },
            ],
            media_penyuluhan: [
              { id: 1, title: "Spanduk", h1: "", h1: "", angka: "", trend: "" },
              { id: 2, title: "Leaflet", h1: "", h1: "", angka: "", trend: "" },
              { id: 3, title: "Sticker", h1: "", h1: "", angka: "", trend: "" },
              {
                id: 4,
                title: "Bilboard",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
            ],
            kegiatan_lalu_lintas: [
              {
                id: 1,
                title: "PENGATURAN",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
              {
                id: 2,
                title: "PENJAGAAN",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
              {
                id: 3,
                title: "PENGAWALAN",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
              { id: 4, title: "PATROLI", h1: "", h1: "", angka: "", trend: "" },
            ],
            dakgar_lantas: [
              {
                id: 1,
                title: "ETLE STATIS",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
              {
                id: 2,
                title: "ETLE MOBILE",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
              {
                id: 3,
                title: "TEGURAN",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
            ],
            jenis_ranmor: [
              {
                id: 1,
                title: "SEPEDA MOTOR",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
                ket: "",
              },
              {
                id: 2,
                title: "MOBIL PENUMPANG",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
                ket: "",
              },
              {
                id: 3,
                title: "BUS",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
                ket: "",
              },
              {
                id: 4,
                title: "MOBIL BARANG",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
                ket: "",
              },
              {
                id: 4,
                title: "RANSUS",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
                ket: "",
              },
            ],
            lantas_roda_dua: [
              {
                id: 1,
                title: "HELM SNI",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
                ket: "",
              },
              {
                id: 2,
                title: "MELAWAN ARUS",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
                ket: "",
              },
              {
                id: 3,
                title: "GUN HP SAAT BERKENDARA",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
                ket: "",
              },
              {
                id: 4,
                title: "PENGARUH ALKOHOL",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
                ket: "",
              },
              {
                id: 4,
                title: "MELEBIHI BATAS KECEPATAN",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
                ket: "",
              },
              {
                id: 5,
                title: "PENGEDARA DIBAWAH UMUR",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
                ket: "",
              },
              {
                id: 6,
                title: "LAIN-LAIN",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
                ket: "",
              },
            ],
            pelanggaran_roda_4_2: [
              {
                id: 1,
                title: "MELAWAN ARUS",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
              { id: 2, title: "GUN HP", h1: "", h1: "", angka: "", trend: "" },
              {
                id: 3,
                title: "PENGARUH ALKOHOL",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
              {
                id: 4,
                title: "OVER SPEED",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
              {
                id: 4,
                title: "DIBAWAH UMUR",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
              {
                id: 4,
                title: " SAFETY BELT",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
              {
                id: 4,
                title: "LAIN-LAIN",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
            ],
            barang_bukti_disita: [
              { id: 1, title: "SIM", h1: "", h1: "", angka: "", trend: "" },
              { id: 2, title: "STNK", h1: "", h1: "", angka: "", trend: "" },
              { id: 2, title: "RANMOR", h1: "", h1: "", angka: "", trend: "" },
            ],
            usia_pelanggaran_1: [
              { id: 1, title: "A", h1: "", h1: "", angka: "", trend: "" },
              { id: 2, title: "A UMUM", h1: "", h1: "", angka: "", trend: "" },
              { id: 3, title: "B I", h1: "", h1: "", angka: "", trend: "" },
              {
                id: 4,
                title: "B I UMUM",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
              { id: 5, title: "B II", h1: "", h1: "", angka: "", trend: "" },
              {
                id: 6,
                title: "B II UMUM",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
              { id: 7, title: "C", h1: "", h1: "", angka: "", trend: "" },
              { id: 8, title: "D", h1: "", h1: "", angka: "", trend: "" },
              {
                id: 9,
                title: "SIM INTERNASIONAL",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
              {
                id: 10,
                title: "TANPA SIM",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
            ],
            profesi_korban_1: [
              { id: 1, title: "PNS", h1: "", h1: "", angka: "", trend: "" },
              {
                id: 2,
                title: "KARYAWAN / SWASTA",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
              {
                id: 3,
                title: "PELAJAR / MAHASISWA",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
              {
                id: 4,
                title: "PENGEMUDI (SUPIR)",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
              { id: 5, title: "TNI", h1: "", h1: "", angka: "", trend: "" },
              { id: 6, title: "POLRI", h1: "", h1: "", angka: "", trend: "" },
              {
                id: 7,
                title: "LAIN - LAIN",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
            ],
            kecelakaan_1: [
              {
                id: 1,
                title: "JUMLAH KEJADIAN",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
              {
                id: 2,
                title: "KORBAN MD",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
              {
                id: 3,
                title: "KORBAN LB",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
              {
                id: 4,
                title: "KORBAN LR",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
              { id: 5, title: "RUMAT", h1: "", h1: "", angka: "", trend: "" },
            ],
            kecelakaan_berd_usia_1: [
              { id: 1, title: "0 - 4", h1: "", h1: "", angka: "", trend: "" },
              { id: 2, title: "5 - 9", h1: "", h1: "", angka: "", trend: "" },
              { id: 3, title: "10 - 14", h1: "", h1: "", angka: "", trend: "" },
              { id: 4, title: "15 - 19", h1: "", h1: "", angka: "", trend: "" },
              { id: 5, title: "21 - 24", h1: "", h1: "", angka: "", trend: "" },
              { id: 6, title: "24 - 29", h1: "", h1: "", angka: "", trend: "" },
              { id: 7, title: "30 - 34", h1: "", h1: "", angka: "", trend: "" },
              { id: 8, title: "35 - 39", h1: "", h1: "", angka: "", trend: "" },
              { id: 9, title: "40 - 44", h1: "", h1: "", angka: "", trend: "" },
              {
                id: 10,
                title: "45 - 49",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
              {
                id: 11,
                title: "50 - 54",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
            ],
            profesi_pelanggar_1: [
              { id: 1, title: "PNS", h1: "", h1: "", angka: "", trend: "" },
              {
                id: 2,
                title: "KARYAWAN / SWASTA",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
              {
                id: 3,
                title: "PELAJAR / MAHASISWA",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
              {
                id: 4,
                title: "PENGEMUDI (SUPIR)",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
              { id: 5, title: "TNI", h1: "", h1: "", angka: "", trend: "" },
              { id: 6, title: "POLRI", h1: "", h1: "", angka: "", trend: "" },
              {
                id: 7,
                title: "LAIN - LAIN",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
            ],
            ranmor_1: [
              {
                id: 1,
                title: "SEPEDA MOTOR",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
              {
                id: 2,
                title: "MOBIL PENUMPANG",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
              { id: 3, title: "BUS", h1: "", h1: "", angka: "", trend: "" },
              {
                id: 4,
                title: "MOBIL BARANG",
                h1: "",
                h1: "",
                angka: "",
                trend: "",
              },
              { id: 5, title: "RANSUS", h1: "", h1: "", angka: "", trend: "" },
            ],
          };
          const formatHeaderTable = {
            judul: req.body.title,
            h2: "H" + parseInt(moment().format("DD")),
            h1: "H" + parseInt(moment().subtract(1, "d").format("DD")),
          };
          await ReportFinal.create(insertDb);

          return res.render("template/daily", {
            date,
            // ...listTables,
            ...req.body,
            ...listTableBab3,
            ...formatHeaderTable,
          });
        }

        case "pdf-download":
          const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disabled-setupid-sandbox"],
            executablePath: process.env.ANEV_CHROME_PATH,
          });

          const page = await browser.newPage();

          await page.goto(
            `${process.env.ANEV_BASE_URL}?type=view&data=${AESEncrypt(
              JSON.stringify(req.body),
              {
                isSafeUrl: true,
              }
            )}`,
            {
              waitUntil: "networkidle0",
              // timeout: 0,
            }
          );
          await page.addStyleTag({
            content: `
              
              @page:first {  }
          `,
          });
          const pdf = await page.pdf({
            displayHeaderFooter: true,
            headerTemplate: `<div style="width: 100%; font-size: 10px; margin: 0 1cm; color: #bbb; height: 30px; text-align: center;">
          <span class="pageNumber" style="font-size: 10px;"></span>
      </div>`,
            footerTemplate: `
          <div style="width: 100%; font-size: 10px; margin: 0 1cm; color: #bbb; height: 30px; text-align: center;">
          
      </div>
        `,
            printBackground: true,
            format: "A4",
            landscape: false,
            margin: {
              top: "80px",
              right: "0px",
              bottom: "80px",
              left: "0px",
            },
            // scale: 1,
            path: `${path.resolve(
              "./report/anev/monthly-" + moment().format("YYYY-MM-DD") + ".pdf"
            )}`,
          });

          await browser.close();

          res.contentType("application/pdf");
          return res.status(200).send(pdf);

        default: {
          return response(res, false, "Input Not Valid", null, 400);
        }
      }
    } catch (error) {
      return response(res, false, error.message, error, 400);
    }
  };
};
