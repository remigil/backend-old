const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const { Op, Sequelize, where } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");

// const LakaLantasMonth = require("../model/count_lakalantas_polda_month");
const LakaLantasDay = require("../model/count_lakalantas_polda_day");

// const SimMonth = require("../model/count_sim_polda_month");
const SimDay = require("../model/count_sim_polda_day");

// const GarlantasMonth = require("../model/count_garlantas_polda_month");
const GarlantasDay = require("../model/count_garlantas_polda_day");

const RanmorDay = require("../model/count_ranmor_polda_day");
// const RanmorMonth = require("../model/count_ranmor_polda_month");

let thisday = moment().subtract(1, "days");
let yesterday = moment().subtract(2, "days");
let thisweek = moment().subtract(6, "days").toDate();
let lastweek = moment().subtract(13, "days").toDate();
let thismonth = moment().endOf("month").format("YYYY-MM-DD");
let lastmonth = moment().subtract(1, "month").endOf("month").format("YYYY-MM-DD");


let StartDateThisMonth = moment().startOf('month').format('YYYY-MM-DD');
let EndDateThisMonth = moment().endOf("month").format("YYYY-MM-DD");

let StartDateYesterdayMonth = moment().subtract(1, "month").startOf("month").format("YYYY-MM-DD");
let EndDateYesterdayMonth = moment()
  .subtract(1, "month")
  .endOf("month")
  .format("YYYY-MM-DD");


let StartDateThisYear = moment().startOf("year").format("YYYY-MM-DD");
let EndDateThisYear = moment().endOf("year").format("YYYY-MM-DD");

let StartDateYesterdayYear = moment()
  .subtract(1, "year")
  .startOf("year")
  .format("YYYY-MM-DD");

let EndDateYesterdatYear = moment()
  .subtract(1, "year")
  .endOf("year")
  .format("YYYY-MM-DD");


let thisstartyear = moment().startOf("year").format("YYYY-MM-DD");
let thisendyear = moment().endOf("year").format("YYYY-MM-DD");
let laststartyear = moment()
  .subtract(1, "year")
  .startOf("year")
  .format("YYYY-MM-DD");
let lastendyear = moment()
  .subtract(1, "year")
  .endOf("year")
  .format("YYYY-MM-DD");

module.exports = class CountHomeMobileController {
  static kecelakaan = async (req, res) => {
    try {
      let lakaPerhariKemarin = await LakaLantasDay.findAll({
        where: {
          date: thisday,
        },
        attributes: ["meninggal_dunia", "luka_berat", "luka_ringan"],
      });

      let lakaPerhariIni = await LakaLantasDay.findAll({
        where: {
          date: yesterday,
        },
        attributes: ["meninggal_dunia", "luka_berat", "luka_ringan"],
      });

      let lakaPermingguKemarin = await LakaLantasDay.findAll({
        where: {
          date: {
            [Op.between]: [lastweek, thisweek],
          },
        },
        attributes: ["meninggal_dunia", "luka_berat", "luka_ringan"],
      });

      let lakaPermingguIni = await LakaLantasDay.findAll({
        where: {
          date: {
            [Op.gte]: thisweek,
          },
        },
        attributes: ["meninggal_dunia", "luka_berat", "luka_ringan"],
      });

      let lakaPerbulanKemarin = await LakaLantasDay.findAll({
        where: {
          date: {
            [Op.between]:[StartDateYesterdayMonth, EndDateYesterdayMonth]
          },
        },
        attributes: ["meninggal_dunia", "luka_berat", "luka_ringan"],
      });

      let lakaPerbulanIni = await LakaLantasDay.findAll({
        where: {
          date: {
            [Op.between]:[StartDateThisMonth, EndDateThisMonth]
          }
        },
        attributes: ["meninggal_dunia", "luka_berat", "luka_ringan"],
      });

      let lakaPertahunKemarin = await LakaLantasDay.findAll({
        where: {
          date: {
            [Op.between]: [StartDateYesterdayYear, EndDateYesterdatYear],
          },
        },
        attributes: ["meninggal_dunia", "luka_berat", "luka_ringan"],
      });

      let lakaPertahunIni = await LakaLantasDay.findAll({
        where: {
          date: {
            [Op.between]: [StartDateThisYear, EndDateThisYear],
          },
        },
        attributes: ["meninggal_dunia", "luka_berat", "luka_ringan"],
      });

      let result_lakaPerhariKemarin =
        lakaPerhariKemarin.length > 0
          ? lakaPerhariKemarin
              .map((element) => {
                let a = Object.values(element.dataValues).reduce((c, d) => {
                  return c + d;
                });
                return a;
              })
              .reduce((f, g) => {
                return f + g;
              })
          : 0;

      let result_lakaPerhariIni =
        lakaPerhariIni.length > 0
          ? lakaPerhariIni
              .map((element) => {
                let a = Object.values(element.dataValues).reduce((c, d) => {
                  return c + d;
                });
                return a;
              })
              .reduce((f, g) => {
                return f + g;
              })
          : 0;

      let result_lakaPermingguKemarin =
        lakaPermingguKemarin.length > 0
          ? lakaPermingguKemarin
              .map((element) => {
                let a = Object.values(element.dataValues).reduce((c, d) => {
                  return c + d;
                });
                return a;
              })
              .reduce((f, g) => {
                return f + g;
              })
          : 0;

      let result_lakaPermingguIni =
        lakaPermingguIni.length > 0
          ? lakaPermingguIni
              .map((element) => {
                let a = Object.values(element.dataValues).reduce((c, d) => {
                  return c + d;
                });
                return a;
              })
              .reduce((f, g) => {
                return f + g;
              })
          : 0;

      let result_lakaPerbulanKemarin =
        lakaPerbulanKemarin.length > 0
          ? lakaPerbulanKemarin
              .map((element) => {
                let a = Object.values(element.dataValues).reduce((c, d) => {
                  return c + d;
                });
                return a;
              })
              .reduce((f, g) => {
                return f + g;
              })
          : 0;

      let result_lakaPerbulanIni =
        lakaPerbulanIni.length > 0
          ? lakaPerbulanIni
              .map((element) => {
                let a = Object.values(element.dataValues).reduce((c, d) => {
                  return c + d;
                });
                return a;
              })
              .reduce((f, g) => {
                return f + g;
              })
          : 0;

      let result_lakaPertahunKemarin =
        lakaPertahunKemarin.length > 0
          ? lakaPertahunKemarin
              .map((element) => {
                let a = Object.values(element.dataValues).reduce((c, d) => {
                  return c + d;
                });
                return a;
              })
              .reduce((f, g) => {
                return f + g;
              })
          : 0;

      let result_lakaPertahunIni =
        lakaPertahunIni.length > 0
          ? lakaPertahunIni
              .map((element) => {
                let a = Object.values(element.dataValues).reduce((c, d) => {
                  return c + d;
                });
                return a;
              })
              .reduce((f, g) => {
                return f + g;
              })
          : 0;

      let laka_perhari = Math.round(
        parseInt(result_lakaPerhariKemarin + result_lakaPerhariIni) / 2
      );
      let laka_perminggu = Math.round(
        parseInt(result_lakaPermingguKemarin + result_lakaPermingguIni) / 2
      );
      let laka_perbulan = Math.round(
        parseInt(result_lakaPerbulanKemarin + result_lakaPerbulanIni) / 2
      );
      let laka_pertahun = Math.round(
        parseInt(result_lakaPertahunKemarin + result_lakaPertahunIni) / 2
      );

      let finalResponse =
        {
          laka_perhari,
          laka_perminggu,
          laka_perbulan,
          laka_pertahun,
        }

      //   let resultPerhariKemarin = Object.values();

      response(res, true, "Succeed", finalResponse);
    } catch (error) {
      response(res, false, "Failed", error.message);
    }
  };

  static sim = async (req, res) => {
    try {
      let simPerhariKemarin = await SimDay.findAll({
        where: {
          date: thisday,
        },
        attributes: ["baru"],
      });

      let simPerhariIni = await SimDay.findAll({
        where: {
          date: yesterday,
        },
        attributes: ["baru"],
      });

      let simPermingguKemarin = await SimDay.findAll({
        where: {
          date: {
            [Op.between]: [lastweek, thisweek],
          },
        },
        attributes: ["baru"],
      });

      let simPermingguIni = await SimDay.findAll({
        where: {
          date: {
            [Op.gte]: thisweek,
          },
        },
        attributes: ["baru"],
      });

      let simPerbulanKemarin = await SimDay.findAll({
        where: {
          date: {
            [Op.between]: [StartDateYesterdayMonth, EndDateYesterdayMonth],
          },
        },
        attributes: ["baru"],
      });

      let simPerbulanIni = await SimDay.findAll({
        where: {
          date: {
            [Op.between] : [StartDateThisMonth, EndDateThisMonth]
          }
        },
        attributes: ["baru"],
      });

      let simPertahunKemarin = await SimDay.findAll({
        where: {
          date: {
            [Op.between]: [StartDateYesterdayYear, EndDateYesterdatYear],
          },
        },
        attributes: ["baru"],
      });

      let simPertahunIni = await SimDay.findAll({
        where: {
          date: {
            [Op.between]: [StartDateThisYear, EndDateThisYear],
          },
        },
        attributes: ["baru"],
      });

      let result_simPerhariKemarin =
        simPerhariKemarin.length > 0
          ? simPerhariKemarin
              .map((element) => {
                let a = Object.values(element.dataValues).reduce((c, d) => {
                  return c + d;
                });
                return a;
              })
              .reduce((f, g) => {
                return f + g;
              })
          : 0;

      let result_simPerhariIni =
        simPerhariIni.length > 0
          ? simPerhariIni
              .map((element) => {
                let a = Object.values(element.dataValues).reduce((c, d) => {
                  return c + d;
                });
                return a;
              })
              .reduce((f, g) => {
                return f + g;
              })
          : 0;

      let result_simPermingguKemarin =
        simPermingguKemarin.length > 0
          ? simPermingguKemarin
              .map((element) => {
                let a = Object.values(element.dataValues).reduce((c, d) => {
                  return c + d;
                });
                return a;
              })
              .reduce((f, g) => {
                return f + g;
              })
          : 0;

      let result_simPermingguIni =
        simPermingguIni.length > 0
          ? simPermingguIni
              .map((element) => {
                let a = Object.values(element.dataValues).reduce((c, d) => {
                  return c + d;
                });
                return a;
              })
              .reduce((f, g) => {
                return f + g;
              })
          : 0;

      let result_simPerbulanKemarin =
        simPerbulanKemarin.length > 0
          ? simPerbulanKemarin
              .map((element) => {
                let a = Object.values(element.dataValues).reduce((c, d) => {
                  return c + d;
                });
                return a;
              })
              .reduce((f, g) => {
                return f + g;
              })
          : 0;

      let result_simPerbulanIni =
        simPerbulanIni.length > 0
          ? simPerbulanIni
              .map((element) => {
                let a = Object.values(element.dataValues).reduce((c, d) => {
                  return c + d;
                });
                return a;
              })
              .reduce((f, g) => {
                return f + g;
              })
          : 0;

      let result_simPertahunKemarin =
        simPertahunKemarin.length > 0
          ? simPertahunKemarin
              .map((element) => {
                let a = Object.values(element.dataValues).reduce((c, d) => {
                  return c + d;
                });
                return a;
              })
              .reduce((f, g) => {
                return f + g;
              })
          : 0;

      let result_simPertahunIni =
        simPertahunIni.length > 0
          ? simPertahunIni
              .map((element) => {
                let a = Object.values(element.dataValues).reduce((c, d) => {
                  return c + d;
                });
                return a;
              })
              .reduce((f, g) => {
                return f + g;
              })
          : 0;

      let sim_perhari = Math.round(
        parseInt(result_simPerhariKemarin + result_simPerhariIni) / 2
      );
      let sim_perminggu = Math.round(
        parseInt(result_simPermingguKemarin + result_simPermingguIni) / 2
      );
      let sim_perbulan = Math.round(
        parseInt(result_simPerbulanKemarin + result_simPerbulanIni) / 2
      );
      let sim_pertahun = Math.round(
        parseInt(result_simPertahunKemarin + result_simPertahunIni) / 2
      );

      let finalResponse = {
          sim_perhari,
          sim_perminggu,
          sim_perbulan,
          sim_pertahun,
        }

      //   let resultPerhariKemarin = Object.values();

      response(res, true, "Succeed", finalResponse);
    } catch (error) {
      response(res, false, "Failed", error.message);
    }
  };

  static pelanggaran = async (req, res) => {
    try {
      let garlantasPerhariKemarin = await GarlantasDay.findAll({
        where: {
          date: thisday,
        },
        attributes: [
          "pelanggaran_berat",
          "pelanggaran_sedang",
          "pelanggaran_ringan",
        ],
      });

      let garlantasPerhariIni = await GarlantasDay.findAll({
        where: {
          date: yesterday,
        },
        attributes: [
          "pelanggaran_berat",
          "pelanggaran_sedang",
          "pelanggaran_ringan",
        ],
      });

      let garlantasPemingguKemarin = await GarlantasDay.findAll({
        where: {
          date: {
            [Op.between]: [lastweek, thisweek],
          },
        },
        attributes: [
          "pelanggaran_berat",
          "pelanggaran_sedang",
          "pelanggaran_ringan",
        ],
      });

      let garlantasPermingguIni = await GarlantasDay.findAll({
        where: {
          date: {
            [Op.gte]: thisweek,
          },
        },
        attributes: [
          "pelanggaran_berat",
          "pelanggaran_sedang",
          "pelanggaran_ringan",
        ],
      });

      let garlantasPerbulanKemarin = await GarlantasDay.findAll({
        where: {
          date: {
            [Op.between]: [StartDateYesterdayMonth, EndDateYesterdayMonth],
          },
        },
        attributes: [
          "pelanggaran_berat",
          "pelanggaran_sedang",
          "pelanggaran_ringan",
        ],
      });

      let garlantasPerbulanIni = await GarlantasDay.findAll({
        where: {
          date: {
            [Op.between]:[StartDateThisMonth, EndDateThisMonth]
          }
        },
        attributes: [
          "pelanggaran_berat",
          "pelanggaran_sedang",
          "pelanggaran_ringan",
        ],
      });

      let garlantasPertahunKemarin = await GarlantasDay.findAll({
        where: {
          date: {
            [Op.between]: [StartDateYesterdayYear, EndDateYesterdatYear],
          },
        },
        attributes: [
          "pelanggaran_berat",
          "pelanggaran_sedang",
          "pelanggaran_ringan",
        ],
      });

      let garlantasPertahunIni = await GarlantasDay.findAll({
        where: {
          date: {
            [Op.between]: [StartDateThisYear, EndDateThisYear],
          },
        },
        attributes: [
          "pelanggaran_berat",
          "pelanggaran_sedang",
          "pelanggaran_ringan",
        ],
      });

      let result_garlantasPerhariKemarin =
        garlantasPerhariKemarin.length > 0
          ? garlantasPerhariKemarin
              .map((element) => {
                let a = Object.values(element.dataValues).reduce((c, d) => {
                  return c + d;
                });
                return a;
              })
              .reduce((f, g) => {
                return f + g;
              })
          : 0;

      let result_garlantasPerhariIni =
        garlantasPerhariIni.length > 0
          ? garlantasPerhariIni
              .map((element) => {
                let a = Object.values(element.dataValues).reduce((c, d) => {
                  return c + d;
                });
                return a;
              })
              .reduce((f, g) => {
                return f + g;
              })
          : 0;

      let result_garlantasPemingguKemarin =
        garlantasPemingguKemarin.length > 0
          ? garlantasPemingguKemarin
              .map((element) => {
                let a = Object.values(element.dataValues).reduce((c, d) => {
                  return c + d;
                });
                return a;
              })
              .reduce((f, g) => {
                return f + g;
              })
          : 0;

      let result_garlantasPermingguIni =
        garlantasPermingguIni.length > 0
          ? garlantasPermingguIni
              .map((element) => {
                let a = Object.values(element.dataValues).reduce((c, d) => {
                  return c + d;
                });
                return a;
              })
              .reduce((f, g) => {
                return f + g;
              })
          : 0;

      let result_garlantasPerbulanKemarin =
        garlantasPerbulanKemarin.length > 0
          ? garlantasPerbulanKemarin
              .map((element) => {
                let a = Object.values(element.dataValues).reduce((c, d) => {
                  return c + d;
                });
                return a;
              })
              .reduce((f, g) => {
                return f + g;
              })
          : 0;

      let result_garlantasPerbulanIni =
        garlantasPerbulanIni.length > 0
          ? garlantasPerbulanIni
              .map((element) => {
                let a = Object.values(element.dataValues).reduce((c, d) => {
                  return c + d;
                });
                return a;
              })
              .reduce((f, g) => {
                return f + g;
              })
          : 0;

      let result_garlantasPertahunKemarin =
        garlantasPertahunKemarin.length > 0
          ? garlantasPertahunKemarin
              .map((element) => {
                let a = Object.values(element.dataValues).reduce((c, d) => {
                  return c + d;
                });
                return a;
              })
              .reduce((f, g) => {
                return f + g;
              })
          : 0;

      let result_garlantasPertahunIni =
        garlantasPertahunIni.length > 0
          ? garlantasPertahunIni
              .map((element) => {
                let a = Object.values(element.dataValues).reduce((c, d) => {
                  return c + d;
                });
                return a;
              })
              .reduce((f, g) => {
                return f + g;
              })
          : 0;

      let pelanggaran_perhari = Math.round(
        parseInt(result_garlantasPerhariKemarin + result_garlantasPerhariIni) /
          2
      );
      let pelanggaran_perminggu = Math.round(
        parseInt(
          result_garlantasPemingguKemarin + result_garlantasPermingguIni
        ) / 2
      );
      let pelanggaran_perbulan = Math.round(
        parseInt(
          result_garlantasPerbulanKemarin + result_garlantasPerbulanIni
        ) / 2
      );
      let pelanggaran_pertahun = Math.round(
        parseInt(
          result_garlantasPertahunKemarin + result_garlantasPertahunIni
        ) / 2
      );

      let finalResponse =
        {
          pelanggaran_perhari,
          pelanggaran_perminggu,
          pelanggaran_perbulan,
          pelanggaran_pertahun,
        }

      //   let resultPerhariKemarin = Object.values();

      response(res, true, "Succeed", finalResponse);
    } catch (error) {
      response(res, false, "Failed", error.message);
    }
  };

  static kendaraan = async (req, res) => {
    try {
      let ranmorPerhariKemarin = await RanmorDay.findAll({
        where: {
          date: thisday,
        },
        attributes: [
          "mobil_penumpang",
          "mobil_barang",
          "mobil_bus",
          "ransus",
          "sepeda_motor"
        ],
      });

      let ranmorPerhariIni = await RanmorDay.findAll({
        where: {
          date: yesterday,
        },
        attributes: [
          "mobil_penumpang",
          "mobil_barang",
          "mobil_bus",
          "ransus",
          "sepeda_motor",
        ],
      });

      let ranmorPemingguKemarin = await RanmorDay.findAll({
        where: {
          date: {
            [Op.between]: [lastweek, thisweek],
          },
        },
        attributes: [
          "mobil_penumpang",
          "mobil_barang",
          "mobil_bus",
          "ransus",
          "sepeda_motor",
        ],
      });

      let ranmorPermingguIni = await RanmorDay.findAll({
        where: {
          date: {
            [Op.gte]: thisweek,
          },
        },
        attributes: [
          "mobil_penumpang",
          "mobil_barang",
          "mobil_bus",
          "ransus",
          "sepeda_motor",
        ],
      });

      let ranmorPerbulanKemarin = await RanmorDay.findAll({
        where: {
          date: {
            [Op.between]: [StartDateYesterdayMonth, EndDateYesterdayMonth],
          },
        },
        attributes: [
          "mobil_penumpang",
          "mobil_barang",
          "mobil_bus",
          "ransus",
          "sepeda_motor",
        ],
      });

      let ranmorPerbulanIni = await RanmorDay.findAll({
        where: {
          date: {
            [Op.between]:[StartDateThisMonth, EndDateThisMonth]
          },
        },
        attributes: [
          "mobil_penumpang",
          "mobil_barang",
          "mobil_bus",
          "ransus",
          "sepeda_motor",
        ],
      });

      let ranmorPertahunKemarin = await RanmorDay.findAll({
        where: {
          date: {
            [Op.between]: [StartDateYesterdayYear, EndDateYesterdatYear],
          },
        },
        attributes: [
          "mobil_penumpang",
          "mobil_barang",
          "mobil_bus",
          "ransus",
          "sepeda_motor",
        ],
      });

      let ranmorPertahunIni = await RanmorDay.findAll({
        where: {
          date: {
            [Op.between]: [StartDateThisYear, EndDateThisYear],
          },
        },
        attributes: [
          "mobil_penumpang",
          "mobil_barang",
          "mobil_bus",
          "ransus",
          "sepeda_motor",
        ],
      });

      let result_ranmorPerhariKemarin =
        ranmorPerhariKemarin.length > 0
          ? ranmorPerhariKemarin
              .map((element) => {
                let a = Object.values(element.dataValues).reduce((c, d) => {
                  return c + d;
                });
                return a;
              })
              .reduce((f, g) => {
                return f + g;
              })
          : 0;

      let result_ranmorPerhariIni =
        ranmorPerhariIni.length > 0
          ? ranmorPerhariIni
              .map((element) => {
                let a = Object.values(element.dataValues).reduce((c, d) => {
                  return c + d;
                });
                return a;
              })
              .reduce((f, g) => {
                return f + g;
              })
          : 0;

      let result_ranmorPemingguKemarin =
        ranmorPemingguKemarin.length > 0
          ? ranmorPemingguKemarin
              .map((element) => {
                let a = Object.values(element.dataValues).reduce((c, d) => {
                  return c + d;
                });
                return a;
              })
              .reduce((f, g) => {
                return f + g;
              })
          : 0;

      let result_ranmorPermingguIni =
        ranmorPermingguIni.length > 0
          ? ranmorPermingguIni
              .map((element) => {
                let a = Object.values(element.dataValues).reduce((c, d) => {
                  return c + d;
                });
                return a;
              })
              .reduce((f, g) => {
                return f + g;
              })
          : 0;

      let result_ranmorPerbulanKemarin =
        ranmorPerbulanKemarin.length > 0
          ? ranmorPerbulanKemarin
              .map((element) => {
                let a = Object.values(element.dataValues).reduce((c, d) => {
                  return c + d;
                });
                return a;
              })
              .reduce((f, g) => {
                return f + g;
              })
          : 0;

      let result_ranmorPerbulanIni =
        ranmorPerbulanIni.length > 0
          ? ranmorPerbulanIni
              .map((element) => {
                let a = Object.values(element.dataValues).reduce((c, d) => {
                  return c + d;
                });
                return a;
              })
              .reduce((f, g) => {
                return f + g;
              })
          : 0;

      let result_ranmorPertahunKemarin =
        ranmorPertahunKemarin.length > 0
          ? ranmorPertahunKemarin
              .map((element) => {
                let a = Object.values(element.dataValues).reduce((c, d) => {
                  return c + d;
                });
                return a;
              })
              .reduce((f, g) => {
                return f + g;
              })
          : 0;

      let result_ranmorPertahunIni =
        ranmorPertahunIni.length > 0
          ? ranmorPertahunIni
              .map((element) => {
                let a = Object.values(element.dataValues).reduce((c, d) => {
                  return c + d;
                });
                return a;
              })
              .reduce((f, g) => {
                return f + g;
              })
          : 0;

      let ranmor_perhari = Math.round(
        parseInt(result_ranmorPerhariKemarin + result_ranmorPerhariIni) /
          2
      );
      let ranmor_perminggu = Math.round(
        parseInt(
          result_ranmorPemingguKemarin + result_ranmorPermingguIni
        ) / 2
      );
      let ranmor_perbulan = Math.round(
        parseInt(
          result_ranmorPerbulanKemarin + result_ranmorPerbulanIni
        ) / 2
      );
      let ranmor_pertahun = Math.round(
        parseInt(
          result_ranmorPertahunKemarin + result_ranmorPertahunIni
        ) / 2
      );

      let finalResponse = {
        ranmor_perhari,
        ranmor_perminggu,
        ranmor_perbulan,
        ranmor_pertahun,
      };

      //   let resultPerhariKemarin = Object.values();

      response(res, true, "Succeed", finalResponse);
    } catch (error) {
      response(res, false, "Failed", error.message);
    }
  };
};
