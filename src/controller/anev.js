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
        return res.render("template/daily", { date, ...listTables });
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
          `http://localhost:3001/anev-daily?type=view`,
          {
            waitUntil: "networkidle0",
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
            top: "60px",
            right: "0px",
            bottom: "60px",
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
