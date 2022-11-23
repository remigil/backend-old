const db = require("../config/database");
const response = require("../lib/response");
const puppeteer = require("puppeteer");
const path = require("path");
const { IDMonths } = require("../lib/generalhelper");
const AnevNews = require("../model/anev_news");
const { Op, Sequelize } = require("sequelize");
const moment = require("moment");

class AnevController {
  static getMonthly = async (req, res) => {
    let { mode } = req.query;
    switch (mode) {
      case "view": {
        let filter = {
          month: req.query.month,
          year: req.query.year,
        };
        filter.monthName = IDMonths[filter.month - 1];
        filter.prevMonth = filter.month > 1 ? filter.month - 1 : 12;
        filter.prevYear = filter.month > 1 ? filter.year : filter.year - 1;
        filter.prevMonthName = IDMonths[filter.prevMonth - 1];
        const newsData = await AnevNews.findAll({
          where: {
            deleted_at: null,
            show_on_monthly: true,
            [Op.and]: [
              Sequelize.fn('EXTRACT(MONTH from "created_at") = ', filter.month),
              Sequelize.fn('EXTRACT(YEAR from "created_at") = ', filter.year),
            ],
          },
          limit: 2,
          order: [["created_at", "desc"]],
        });
        let dataLakaOnMonth = await db.query(
          `SELECT SUM(laka.luka_berat)+SUM(laka.luka_ringan)+SUM(laka.meninggal_dunia) as jumlah_laka,
              SUM(laka.meninggal_dunia) as meninggal_dunia,
              SUM(laka.luka_berat) as luka_berat,
              SUM(laka.luka_ringan) as luka_ringan
              FROM "count_lakalantas_polda_month" laka
              WHERE EXTRACT(MONTH from laka."date")= :month
              AND EXTRACT(YEAR from laka."date")= :year`,
          {
            replacements: { month: filter.month, year: filter.year },
          }
        );
        dataLakaOnMonth = dataLakaOnMonth[0][0];
        dataLakaOnMonth.jumlah_laka = dataLakaOnMonth.jumlah_laka
          ? parseInt(dataLakaOnMonth.jumlah_laka)
          : 0;
        dataLakaOnMonth.meninggal_dunia = dataLakaOnMonth.meninggal_dunia
          ? parseInt(dataLakaOnMonth.meninggal_dunia)
          : 0;
        dataLakaOnMonth.luka_berat = dataLakaOnMonth.luka_berat
          ? parseInt(dataLakaOnMonth.luka_berat)
          : 0;
        dataLakaOnMonth.luka_ringan = dataLakaOnMonth.luka_ringan
          ? parseInt(dataLakaOnMonth.luka_ringan)
          : 0;

        let dataLakaPrevMonth = await db.query(
          `SELECT SUM(laka.luka_berat)+SUM(laka.luka_ringan)+SUM(laka.meninggal_dunia) as jumlah_laka,
              SUM(laka.meninggal_dunia) as meninggal_dunia,
              SUM(laka.luka_berat) as luka_berat,
              SUM(laka.luka_ringan) as luka_ringan
              FROM "count_lakalantas_polda_month" laka
              WHERE EXTRACT(MONTH from laka."date")= :month
              AND EXTRACT(YEAR from laka."date")= :year`,
          {
            replacements: { month: filter.prevMonth, year: filter.prevYear },
          }
        );
        dataLakaPrevMonth = dataLakaPrevMonth[0][0];
        dataLakaPrevMonth.jumlah_laka = dataLakaPrevMonth.jumlah_laka
          ? parseInt(dataLakaPrevMonth.jumlah_laka)
          : 0;
        dataLakaPrevMonth.meninggal_dunia = dataLakaPrevMonth.meninggal_dunia
          ? parseInt(dataLakaPrevMonth.meninggal_dunia)
          : 0;
        dataLakaPrevMonth.luka_berat = dataLakaPrevMonth.luka_berat
          ? parseInt(dataLakaPrevMonth.luka_berat)
          : 0;
        dataLakaPrevMonth.luka_ringan = dataLakaPrevMonth.luka_ringan
          ? parseInt(dataLakaPrevMonth.luka_ringan)
          : 0;

        let dataGarOnMonth = await db.query(
          `SELECT SUM(gar.pelanggaran_berat)+SUM(gar.pelanggaran_ringan)+SUM(gar.pelanggaran_sedang) as jumlah_gar,
          SUM(gar.pelanggaran_berat) as pelanggaran_berat,
          SUM(gar.pelanggaran_sedang) as pelanggaran_sedang,
          SUM(gar.pelanggaran_ringan) as pelanggaran_ringan
          FROM count_garlantas_polda_month gar
          WHERE EXTRACT(MONTH from gar."date")= :month
          AND EXTRACT(YEAR from gar."date")= :year`,
          {
            replacements: {
              month: filter.month,
              year: filter.year,
            },
          }
        );
        dataGarOnMonth = dataGarOnMonth[0][0];
        dataGarOnMonth.jumlah_gar = dataGarOnMonth.jumlah_gar
          ? parseInt(dataGarOnMonth.jumlah_gar)
          : 0;
        dataGarOnMonth.pelanggaran_berat = dataGarOnMonth.pelanggaran_berat
          ? parseInt(dataGarOnMonth.pelanggaran_berat)
          : 0;
        dataGarOnMonth.pelanggaran_sedang = dataGarOnMonth.pelanggaran_sedang
          ? parseInt(dataGarOnMonth.pelanggaran_sedang)
          : 0;
        dataGarOnMonth.pelanggaran_ringan = dataGarOnMonth.pelanggaran_ringan
          ? parseInt(dataGarOnMonth.pelanggaran_ringan)
          : 0;

        let dataGarOnPrevMonth = await db.query(
          `SELECT SUM(gar.pelanggaran_berat)+SUM(gar.pelanggaran_ringan)+SUM(gar.pelanggaran_sedang) as jumlah_gar,
          SUM(gar.pelanggaran_berat) as pelanggaran_berat,
          SUM(gar.pelanggaran_sedang) as pelanggaran_sedang,
          SUM(gar.pelanggaran_ringan) as pelanggaran_ringan
          FROM count_garlantas_polda_month gar
          WHERE EXTRACT(MONTH from gar."date")= :month
          AND EXTRACT(YEAR from gar."date")= :year`,
          {
            replacements: {
              month: filter.prevMonth,
              year: filter.prevYear,
            },
          }
        );
        dataGarOnPrevMonth = dataGarOnPrevMonth[0][0];
        dataGarOnPrevMonth.jumlah_gar = dataGarOnPrevMonth.jumlah_gar
          ? parseInt(dataGarOnPrevMonth.jumlah_gar)
          : 0;
        dataGarOnPrevMonth.pelanggaran_berat =
          dataGarOnPrevMonth.pelanggaran_berat
            ? parseInt(dataGarOnPrevMonth.pelanggaran_berat)
            : 0;
        dataGarOnPrevMonth.pelanggaran_sedang =
          dataGarOnPrevMonth.pelanggaran_sedang
            ? parseInt(dataGarOnPrevMonth.pelanggaran_sedang)
            : 0;
        dataGarOnPrevMonth.pelanggaran_ringan =
          dataGarOnPrevMonth.pelanggaran_ringan
            ? parseInt(dataGarOnPrevMonth.pelanggaran_ringan)
            : 0;

        const analisis = {
          page3: {
            grafik_kecelakaan: {
              kesimpulan:
                dataLakaOnMonth.jumlah_laka > dataLakaPrevMonth.jumlah_laka
                  ? "kenaikan"
                  : dataLakaOnMonth.jumlah_laka == dataLakaPrevMonth.jumlah_laka
                  ? "kesamaan"
                  : "penurunan",
              selisih: Math.abs(
                dataLakaPrevMonth.jumlah_laka - dataLakaOnMonth.jumlah_laka
              ),
              pesentase:
                100 -
                (dataLakaOnMonth.jumlah_laka < dataLakaPrevMonth.jumlah_laka
                  ? (dataLakaOnMonth.jumlah_laka * 100) /
                    dataLakaPrevMonth.jumlah_laka
                  : (dataLakaPrevMonth.jumlah_laka * 100) /
                    dataLakaOnMonth.jumlah_laka
                ).toFixed(2),
            },
          },
          page4: {
            grafik_dakgar: {
              kesimpulan:
                dataGarOnMonth.jumlah_gar > dataGarOnPrevMonth.jumlah_gar
                  ? "kenaikan"
                  : dataGarOnMonth.jumlah_gar == dataGarOnPrevMonth.jumlah_gar
                  ? "kesamaan"
                  : "penurunan",
              selisih: Math.abs(
                dataGarOnPrevMonth.jumlah_gar - dataGarOnMonth.jumlah_gar
              ),
              pesentase:
                100 -
                (dataGarOnMonth.jumlah_gar < dataGarOnPrevMonth.jumlah_gar
                  ? (dataGarOnMonth.jumlah_gar * 100) /
                    dataGarOnPrevMonth.jumlah_gar
                  : (dataGarOnPrevMonth.jumlah_gar * 100) /
                    dataGarOnMonth.jumlah_gar
                ).toFixed(2),
            },
          },
        };

        let data = {
          page1: {
            title: filter.monthName + " " + filter.year,
          },
          page2: {
            news: newsData,
          },
          page3: {
            grafik_kecelakaan: {
              categories: [
                "Jumlah Laka",
                "Meninggal Dunia",
                "Luka Berat",
                "Luka Ringan",
              ],
              series: [
                {
                  name: filter.prevMonthName + " " + filter.prevYear,
                  data: [
                    dataLakaPrevMonth.jumlah_laka,
                    dataLakaPrevMonth.meninggal_dunia,
                    dataLakaPrevMonth.luka_berat,
                    dataLakaPrevMonth.luka_ringan,
                  ],
                  color: "#124899",
                },
                {
                  name: filter.monthName + " " + filter.year,
                  data: [
                    dataLakaOnMonth.jumlah_laka,
                    dataLakaOnMonth.meninggal_dunia,
                    dataLakaOnMonth.luka_berat,
                    dataLakaOnMonth.luka_ringan,
                  ],
                  color: "#991212",
                },
              ],
            },
            analisis: `Analisis data kecelakaan pada bulan ini adalah kecelakaan lalu
                lintas mengalami <b>${analisis.page3.grafik_kecelakaan.kesimpulan}</b> sebanyak <b>${analisis.page3.grafik_kecelakaan.pesentase}%</b> pada bulan sebelumnya.
                Karena jumlah laka bulan <b>${filter.prevMonthName} ${filter.prevYear}</b> sebanyak <b>${dataLakaPrevMonth.jumlah_laka}</b> kejadian
                sedangkan bulan <b>${filter.monthName} ${filter.year}</b> sebanyak <b>${dataLakaOnMonth.jumlah_laka}</b> kejadian. <b>Selisih</b>
                dari <b>jumlah kecelakaan</b> sebanyak <b>${analisis.page3.grafik_kecelakaan.selisih}</b> kejadian.`,
          },
          page4: {
            grafik_dakgar: {
              categories: [
                "JUMLAH DAKGAR",
                "Gar Berat",
                "Gar Sedang",
                "Gar Ringan",
              ],
              series: [
                {
                  name: filter.prevMonthName + " " + filter.prevYear,
                  data: [
                    dataGarOnPrevMonth.jumlah_gar,
                    dataGarOnPrevMonth.pelanggaran_berat,
                    dataGarOnPrevMonth.pelanggaran_sedang,
                    dataGarOnPrevMonth.pelanggaran_ringan,
                  ],
                  color: "#124899",
                },
                {
                  name: filter.monthName + " " + filter.year,
                  data: [
                    dataGarOnMonth.jumlah_gar,
                    dataGarOnMonth.pelanggaran_berat,
                    dataGarOnMonth.pelanggaran_sedang,
                    dataGarOnMonth.pelanggaran_ringan,
                  ],
                  color: "#991212",
                },
              ],
            },
            analisis: `Analisis berdasarkan data akumulasi rata-rata pelanggaran pada bulan <b>${filter.monthName} ${filter.year}</b>
            adalah pelanggaran lalu lintas mengalami <b>${analisis.page4.grafik_dakgar.kesimpulan}</b> sebanyak <b>${analisis.page4.grafik_dakgar.pesentase}%</b> pada bulan sebelumnya.
                Karena jumlah pelanggaran pada bulan <b>${filter.prevMonthName} ${filter.prevYear}</b> sebanyak <b>${dataGarOnPrevMonth.jumlah_gar}</b> kejadian
                sedangkan bulan <b>${filter.monthName} ${filter.year}</b> sebanyak <b>${dataGarOnMonth.jumlah_gar}</b> kejadian. <b>Selisih</b>
                dari <b>jumlah pelanggaran</b> sebanyak <b>${analisis.page4.grafik_dakgar.selisih}</b> kejadian.`,
          },
        };

        return res.render("anev/monthly", { filter, data });
      }
      case "pdf-download": {
        const browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", "--disabled-setupid-sandbox"],
          executablePath: process.env.ANEV_CHROME_PATH,
        });
        const page = await browser.newPage();
        var { month, year } = req.query;
        await page.goto(
          `${process.env.ANEV_BASE_URL}/getMonthly?mode=view&month=${month}&year=${year}`,
          {
            waitUntil: "networkidle0",
          }
        );
        const pdf = await page.pdf({
          printBackground: true,
          format: "A4",
          landscape: true,
          margin: {
            top: "0px",
            right: "0px",
            bottom: "0px",
            left: "0px",
          },
          // scale: 1,
          path: `${path.resolve("./report/anev/monthly.pdf")}`,
        });

        await browser.close();

        res.contentType("application/pdf");
        return res.status(200).send(pdf);
      }
      default: {
        return response(res, false, "Input Not Valid", null, 400);
      }
    }
  };
  static getDaily = async (req, res) => {
    let { mode } = req.query;
    switch (mode) {
      case "view": {
        let filter = {
          date: req.query.date,
        };
        filter.dateName = moment(filter.date)
          .locale("id")
          .format("dddd, DD MMMM YYYY");
        filter.datePrev = moment(filter.date).subtract(1, "day");
        filter.datePrevName = moment(filter.datePrev)
          .locale("id")
          .format("dddd, DD MMMM YYYY");
        const newsData = await AnevNews.findOne({
          where: {
            deleted_at: null,
            show_on_daily: true,
            [Op.and]: [Sequelize.fn("DATE(created_at) = ", filter.date)],
          },
          limit: 2,
          order: [["created_at", "desc"]],
        });
        //return res.send(newsData);
        let data = {
          page1: {
            title: filter.dateName,
          },
          page2: {
            photo: newsData.photo,
            description: newsData.description,
          },
          page3: {
            laka: [
              {
                no: 1,
                uraian: `<b>JUMLAH LAKA</b>`,
                currentDate: `<b>192</b>`,
                prevDate: `<b>100</b>`,
                trendAngka: `<b>92</b>`,
                trendPersen: `<b>10</b>`,
                kesimpulan: `<b>NAIK</b>`,
              },
              {
                no: 2,
                uraian: `MENINGGAL DUNIA`,
                currentDate: `11`,
                prevDate: `10`,
                trendAngka: `1`,
                trendPersen: `1`,
                kesimpulan: `NAIK`,
              },
              {
                no: 3,
                uraian: `LUKA BERAT`,
                currentDate: `8`,
                prevDate: `10`,
                trendAngka: `2`,
                trendPersen: `2`,
                kesimpulan: `TURUN`,
              },
              {
                no: 4,
                uraian: `LUKA RINGAN`,
                currentDate: `1`,
                prevDate: `0`,
                trendAngka: `1`,
                trendPersen: `1`,
                kesimpulan: `NAIK`,
              },
              {
                no: 5,
                uraian: `MATERIAL`,
                currentDate: `200.000.000`,
                prevDate: `150.000.000`,
                trendAngka: `-50.000.000`,
                trendPersen: `20%`,
                kesimpulan: `NAIK`,
              },
            ],
            dakgar: [
              {
                no: 1,
                uraian: `<b>JUMLAH DAKGAR</b>`,
                currentDate: `<b>192</b>`,
                prevDate: `<b>100</b>`,
                trendAngka: `<b>92</b>`,
                trendPersen: `<b>10</b>`,
                kesimpulan: `<b>NAIK</b>`,
              },
              {
                no: 2,
                uraian: `GAR BERAT`,
                currentDate: `11`,
                prevDate: `10`,
                trendAngka: `1`,
                trendPersen: `1`,
                kesimpulan: `NAIK`,
              },
              {
                no: 3,
                uraian: `GAR SEDANG`,
                currentDate: `8`,
                prevDate: `10`,
                trendAngka: `2`,
                trendPersen: `2`,
                kesimpulan: `TURUN`,
              },
              {
                no: 4,
                uraian: `GAR RINGAN`,
                currentDate: `1`,
                prevDate: `0`,
                trendAngka: `1`,
                trendPersen: `1`,
                kesimpulan: `NAIK`,
              },
            ],
          },
          page4: {
            grafik_laka: {
              categories: [
                "Jumlah Laka",
                "Meninggal Dunia",
                "Luka Berat",
                "Luka Sedang",
                "Luka Ringan",
              ],
              series: [
                {
                  name: filter.datePrevName,
                  data: [100, 11, 12, 1],
                  color: "#063ac9",
                },
                {
                  name: filter.dateName,
                  data: [81, 19, 15, 3],
                  color: "#e3781b",
                },
              ],
            },
            pie_laka: {
              data: [
                ["Jumlah Laka", 60],
                ["Meninggal Dunia", 10],
                ["Luka Berat", 10],
                ["Luka Sedang", 5],
                ["Luka Ringan", 15],
              ],
            },
            analisis: `Analisis data akumulasi rata-rata kecelakaan pada hari ini adalah kecelakaan lalu lintas mengalami kenaikan sebanyak 16%
            dibandingkan hari sebelumnya.
            Jumlah laka pada tanggal 4 Oktober 2022 sebanyak 118 kejadian
            dan 5 Oktober 2022 memiliki jumlah kecelakaan sebanyak 123
            kejadian sehingga memiliki selisih sebanyak 5 kejadian. Tetapi
            mengalami penurunan pada jumlah meninggal dunia sebanyak
            35%.`,
          },
          page5: {
            laka: [
              {
                no: 1,
                name: "JABAR",
                jumlah_laka: 10,
                meninggal_dunia: 3,
                luka_berat: 3,
                luka_ringan: 7,
              },
              {
                no: 2,
                name: "JATIM",
                jumlah_laka: 12,
                meninggal_dunia: 1,
                luka_berat: 13,
                luka_ringan: 3,
              },
              {
                no: 3,
                name: "JATENG",
                jumlah_laka: 19,
                meninggal_dunia: 2,
                luka_berat: 10,
                luka_ringan: 1,
              },
            ],
          },
          pageMaps: [
            {
              title: `1. POLDA DKI JAKARTA`,
              map: `https://jakarta.bpk.go.id/wp-content/uploads/2011/11/Peta-Wilayah-Jakarta.jpg`,
              data: [
                ["JUMLAH KEJADIAN", 33, 42, 9, 27],
                ["MENINGGAL DUNIA", 3, 2, -1, 33],
                ["LUKA BERAT", 0, 1, 1, 0],
                ["LUKA RINGAN", 36, 51, 15, 42],
              ],
              analisis: `BERDASARKAN DATA AKUMULASI RATA-RATA TREND KECELAKAAN DI WILAYAH POLDA JAWA TENGAH HASILNYA NAIK 3% DARI HARI SEBELUMNYA.`,
            },
            {
              title: `2. POLDA JAWA BARAT`,
              map: `https://upload.wikimedia.org/wikipedia/commons/8/8b/Map_of_West_Java_with_cities_and_regencies_names.png`,
              data: [
                ["JUMLAH KEJADIAN", 33, 42, 9, 27],
                ["MENINGGAL DUNIA", 3, 2, -1, 33],
                ["LUKA BERAT", 0, 1, 1, 0],
                ["LUKA RINGAN", 36, 51, 15, 42],
              ],
              analisis: `BERDASARKAN DATA AKUMULASI RATA-RATA TREND KECELAKAAN DI WILAYAH POLDA JAWA TENGAH HASILNYA NAIK 3% DARI HARI SEBELUMNYA.`,
            },
            {
              title: `3. POLDA SULAWESI TENGAH`,
              map: `https://www.tataruang.id/wp-content/uploads/2022/06/peta-sulawesi-tengah-hd.jpg`,
              data: [
                ["JUMLAH KEJADIAN", 33, 42, 9, 27],
                ["MENINGGAL DUNIA", 3, 2, -1, 33],
                ["LUKA BERAT", 0, 1, 1, 0],
                ["LUKA RINGAN", 36, 51, 15, 42],
              ],
              analisis: `BERDASARKAN DATA AKUMULASI RATA-RATA TREND KECELAKAAN DI WILAYAH POLDA JAWA TENGAH HASILNYA NAIK 3% DARI HARI SEBELUMNYA.`,
            },
          ],
          page9: {
            pie_dakgar: {
              data: [
                ["JUMLAH DAKGAR", 60],
                ["Gar Berat", 10],
                ["Gar Sedang", 10],
                ["Gar Ringan", 5],
              ],
            },
            bar_dakgar: {
              categories: [
                "JUMLAH DAKGAR",
                "Gar Berat",
                "Gar Sedang",
                "Gar Ringan",
              ],
              series: [
                {
                  name: filter.datePrevName,
                  data: [100, 11, 12, 1],
                  color: "#063ac9",
                },
                {
                  name: filter.dateName,
                  data: [81, 19, 15, 7],
                  color: "#e3781b",
                },
              ],
            },
            analisis: `Analisis berdasarkan data akumulasi rata-rata pelanggaran pada 5 Oktober 2022
            adalah pelanggaran lalu lintas mengalami kenaikan sebanyak 15% pada hari
            sebelumnya. Karena jumlah pelanggaran pada 4 Oktober 2022 sebanyak 8.494
            kejadian dan 5 Oktober 2022 sebanyak 9.915 kejadian. Selisih dari jumlah
            pelanggaran sebanyak 1.421 kejadian. `,
          },
          page10: {
            tabulasi_gar: [
              {
                no: 1,
                name: "DKI Jakarta",
                jumlah_gar: 100,
                pelanggaran_berat: 10,
                pelanggaran_sedang: 80,
                pelanggaran_ringan: 10,
              },
            ],
          },
          page11: {
            grafik_rangking: {
              categories: [
                "Jumlah Laka",
                "Meninggal Dunia",
                "Luka Berat",
                "Luka Sedang",
                "Luka Ringan",
              ],
              series: [
                {
                  name: filter.datePrevName,
                  data: [100, 11, 12, 1],
                  color: "#063ac9",
                },
                {
                  name: filter.dateName,
                  data: [81, 19, 15, 3],
                  color: "#e3781b",
                },
              ],
            },
            grafik_polda: [
              {
                title: "1. POLDA DKI JAKARTA",
                logo: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Lambang_Polri.png",
                id_graphic: "a",
                categories: ["JUM", "PB", "PS", "PR"],
                series: [
                  {
                    name: filter.datePrevName,
                    data: [29, 8, 10, 23],
                    color: "#063ac9",
                  },
                  {
                    name: filter.dateName,
                    data: [11, 20, 5, 3],
                    color: "#e3781b",
                  },
                ],
              },
              {
                title: "2. POLDA JAWA BARAT",
                logo: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Lambang_Polri.png",
                id_graphic: "b",
                categories: ["JUM", "PB", "PS", "PR"],
                series: [
                  {
                    name: filter.datePrevName,
                    data: [100, 11, 12, 1],
                    color: "#063ac9",
                  },
                  {
                    name: filter.dateName,
                    data: [81, 19, 15, 3],
                    color: "#e3781b",
                  },
                ],
              },
              {
                title: "3. POLDA JAWA TENGAH",
                logo: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Lambang_Polri.png",
                id_graphic: "c",
                categories: ["JUM", "PB", "PS", "PR"],
                series: [
                  {
                    name: filter.datePrevName,
                    data: [8, 1, 12, 2],
                    color: "#063ac9",
                  },
                  {
                    name: filter.dateName,
                    data: [12, 9, 5, 13],
                    color: "#e3781b",
                  },
                ],
              },
            ],
          },
        };

        return res.render("anev/daily", { filter, data });
      }
      case "pdf-download": {
        const browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", "--disabled-setupid-sandbox"],
          executablePath: process.env.ANEV_CHROME_PATH,
        });
        const page = await browser.newPage();
        var { date } = req.query;
        await page.goto(
          `${process.env.ANEV_BASE_URL}/getDaily?mode=view&date=${date}`,
          {
            waitUntil: "networkidle0",
          }
        );
        const pdf = await page.pdf({
          printBackground: true,
          format: "A4",
          landscape: true,
          margin: {
            top: "0px",
            right: "0px",
            bottom: "0px",
            left: "0px",
          },
          // scale: 1,
          path: `${path.resolve("./report/anev/daily.pdf")}`,
        });

        await browser.close();

        //return res.send("ok");
        res.contentType("application/pdf");
        return res.status(200).send(pdf);
      }
      default: {
        return response(res, false, "Input Not Valid", null, 400);
      }
    }
  };
}

module.exports = AnevController;
