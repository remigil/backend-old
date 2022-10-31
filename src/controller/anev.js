const response = require("../lib/response");
const User = require("../model/user");
const bcrypt = require("bcrypt");
const { JWTEncrypt, JWTVerify, AESDecrypt } = require("../lib/encryption");
const moment = require("moment");
const TokenTrackNotif = require("../model/token_track_notif");
const Officer = require("../model/officer");
const Account = require("../model/account");
const fs = require("fs");
const { default: readXlsxFile } = require("read-excel-file/node");
const { replace } = require("lodash");
const ReportLogin = require("../model/reportLogin");
const puppeteer = require("puppeteer");
const path = require("path");
module.exports = class Anev {
  static daily = async (req, res) => {
    const { type } = req.query;
    moment.locale("id");
    const date = moment().format("LL");
    switch (type) {
      case "view": {
        const listTables = {
          lalu_lintas: [
            { id: 1, title: "MEDIA CETAK", angka: "" },
            { id: 2, title: "MEDIA ELEKTRONIK", angka: "" },
            { id: 3, title: "MEDIA SOSIAL", angka: "" },
            { id: 4, title: "LAIN", angka: "" },
          ],
          media_penyuluhan_1: [
            { id: 1, title: "Spanduk", angka: "" },
            { id: 2, title: "Leaflet", angka: "" },
            { id: 3, title: "Sticker", angka: "" },
            { id: 4, title: "Bilboard", angka: "" },
          ],
          kegiatan_lalu_lintas_1: [
            { id: 1, title: "PENGATURAN", angka: "" },
            { id: 2, title: "PENJAGAAN", angka: "" },
            { id: 3, title: "PENGAWALAN", angka: "" },
            { id: 4, title: "PATROLI", angka: "" },
          ],
          jenis_etle: [
            { id: 1, title: "ETLE STATIS", angka: "" },
            { id: 2, title: "ETLE MOBILE", angka: "" },
            { id: 3, title: "TEGURAN", angka: "" },
          ],

          pelanggaran_roda_2: [
            { id: 1, title: "HELM SNI", angka: "" },
            { id: 2, title: "MELAWAN ARUS", angka: "" },
            { id: 3, title: "GUN HP SAAT BERKENDARA", angka: "" },
            { id: 4, title: "PENGARUH ALKOHOL", angka: "" },
            { id: 4, title: "MELEBIHI BATAS KECEPATAN", angka: "" },
            { id: 4, title: "PENGEDARA DIBAWAH UMUR", angka: "" },
            { id: 4, title: "LAIN-LAIN", angka: "" },
          ],
          pelanggaran_roda_4: [
            { id: 1, title: "MELAWAN ARUS", angka: "" },
            { id: 2, title: "GUN HP", angka: "" },
            { id: 3, title: "PENGARUH ALKOHOL", angka: "" },
            { id: 4, title: "OVER SPEED", angka: "" },
            { id: 4, title: "DIBAWAH UMUR", angka: "" },
            { id: 4, title: " SAFETY BELT", angka: "" },
            { id: 4, title: "LAIN-LAIN", angka: "" },
          ],
          barang_bukti: [
            { id: 1, title: "SIM", angka: "" },
            { id: 2, title: "STNK", angka: "" },
            { id: 3, title: "RANMOR", angka: "" },
          ],
          ranmor: [
            { id: 1, title: "SEPEDA MOTOR", angka: "" },
            { id: 2, title: "MOBIL PENUMPANG", angka: "" },
            { id: 3, title: "BUS", angka: "" },
            { id: 4, title: "MOBIL BARANG", angka: "" },
            { id: 5, title: "RANSUS", angka: "" },
          ],
          profesi_pelanggar: [
            { id: 1, title: "PNS", angka: "" },
            { id: 2, title: "KARYAWAN / SWASTA", angka: "" },
            { id: 3, title: "PELAJAR / MAHASISWA", angka: "" },
            { id: 4, title: "PENGEMUDI (SUPIR)", angka: "" },
            { id: 5, title: "TNI", angka: "" },
            { id: 6, title: "POLRI", angka: "" },
            { id: 7, title: "LAIN - LAIN", angka: "" },
          ],
          usia_pelanggaran: [
            { id: 1, title: "0 - 15", angka: "" },
            { id: 2, title: "16 - 20", angka: "" },
            { id: 3, title: "21 - 25", angka: "" },
            { id: 4, title: "26 - 30", angka: "" },
            { id: 5, title: "31-35", angka: "" },
            { id: 6, title: "36 - 40", angka: "" },
            { id: 7, title: "41 - 45", angka: "" },
            { id: 8, title: "46 - 50", angka: "" },
            { id: 9, title: "46 - 50", angka: "" },
            { id: 10, title: "51 - 60", angka: "" },
            { id: 11, title: "> 60", angka: "" },
          ],

          sim_pelanggar: [
            { id: 1, title: "A", angka: "" },
            { id: 2, title: "A UMUM", angka: "" },
            { id: 3, title: "B I", angka: "" },
            { id: 4, title: "B I UMUM", angka: "" },
            { id: 5, title: "B II", angka: "" },
            { id: 6, title: "B II UMUM", angka: "" },
            { id: 7, title: "C", angka: "" },
            { id: 8, title: "D", angka: "" },
            { id: 9, title: "SIM INTERNASIONAL", angka: "" },
            { id: 10, title: "TANPA SIM", angka: "" },
          ],
          lokasi_pelanggar: [
            { id: 1, title: "PEMUKIMAN", angka: "" },
            { id: 2, title: "PERBELANJAAN", angka: "" },
            { id: 3, title: "PERKANTORAN", angka: "" },
            { id: 4, title: "WISATA", angka: "" },
          ],
          jenis_jalan: [
            { id: 1, title: "PEMUKIMAN", angka: "" },
            { id: 2, title: "PERBELANJAAN", angka: "" },
            { id: 3, title: "PERKANTORAN", angka: "" },
            { id: 4, title: "WISATA", angka: "" },
          ],
          kecelakaan: [
            { id: 1, title: "JUMLAH KEJADIAN", angka: "" },
            { id: 2, title: "KORBAN MD", angka: "" },
            { id: 3, title: "KORBAN LB", angka: "" },
            { id: 4, title: "KORBAN LR", angka: "" },
            { id: 5, title: "RUMAT", angka: "" },
          ],
          kecelakaan_berd_usia: [
            { id: 1, title: "0 - 4", angka: "" },
            { id: 2, title: "5 - 9", angka: "" },
            { id: 3, title: "10 - 14", angka: "" },
            { id: 4, title: "15 - 19", angka: "" },
            { id: 5, title: "21 - 24", angka: "" },
            { id: 6, title: "24 - 29", angka: "" },
            { id: 7, title: "30 - 34", angka: "" },
            { id: 8, title: "35 - 39", angka: "" },
            { id: 9, title: "40 - 44", angka: "" },
            { id: 10, title: "45 - 49", angka: "" },
            { id: 11, title: "50 - 54", angka: "" },
          ],
          profesi_korban: [
            { id: 1, title: "PNS", angka: "" },
            { id: 2, title: "KARYAWAN / SWASTA", angka: "" },
            { id: 3, title: "PELAJAR / MAHASISWA", angka: "" },
            { id: 4, title: "PENGEMUDI (SUPIR)", angka: "" },
            { id: 5, title: "TNI", angka: "" },
            { id: 6, title: "POLRI", angka: "" },
            { id: 7, title: "LAIN - LAIN", angka: "" },
          ],
          kecelakaan_berd_pendidikan: [
            { id: 1, title: "SD", angka: "" },
            { id: 2, title: "SLTP", angka: "" },
            { id: 3, title: "SLTA", angka: "" },
            { id: 4, title: "D 3", angka: "" },
            { id: 5, title: "S1", angka: "" },
            { id: 6, title: "S2", angka: "" },
            { id: 7, title: "TDK DIKETAHUI", angka: "" },
          ],
          kecelakaan_berd_kendaraan: [
            { id: 1, title: "SEPEDA MOTOR", angka: "" },
            { id: 2, title: "MOBIL PENUMPANG", angka: "" },
            { id: 3, title: "BUS", angka: "" },
            { id: 4, title: "MOBIL BARANG", angka: "" },
            { id: 5, title: "RANSUS", angka: "" },
          ],
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
            { id: 4, title: "Bilboard", h1: "", h1: "", angka: "", trend: "" },
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
            { id: 2, title: "PENJAGAAN", h1: "", h1: "", angka: "", trend: "" },
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
            { id: 4, title: "LAIN-LAIN", h1: "", h1: "", angka: "", trend: "" },
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
            { id: 4, title: "B I UMUM", h1: "", h1: "", angka: "", trend: "" },
            { id: 5, title: "B II", h1: "", h1: "", angka: "", trend: "" },
            { id: 6, title: "B II UMUM", h1: "", h1: "", angka: "", trend: "" },
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
            { id: 2, title: "KORBAN MD", h1: "", h1: "", angka: "", trend: "" },
            { id: 3, title: "KORBAN LB", h1: "", h1: "", angka: "", trend: "" },
            { id: 4, title: "KORBAN LR", h1: "", h1: "", angka: "", trend: "" },
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
            { id: 10, title: "45 - 49", h1: "", h1: "", angka: "", trend: "" },
            { id: 11, title: "50 - 54", h1: "", h1: "", angka: "", trend: "" },
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
        return res.render("template/daily", {
          date,
          ...listTables,
          ...listTableBab3,
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
          // `${process.env.ANEV_BASE_URL}/getMonthly?mode=view&month=${month}&year=${year}`,
          `http://k3ig20korlantas.id:3001/anev-daily?type=view`,
          {
            waitUntil: "networkidle",
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
          path: `${path.resolve("./report/anev/monthly.pdf")}`,
        });

        await browser.close();

        res.contentType("application/pdf");
        return res.status(200).send(pdf);

      default: {
        return response(res, false, "Input Not Valid", null, 400);
      }
    }
  };
};
