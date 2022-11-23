const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const { Op, Sequelize, where } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");

const Master_lakalanggar = require("../model/input_laka_langgar");
const Lakalanggar_polda_day = require("../model/count_lakalanggar_polda_day");
const Lakalanggar_polda_month = require("../model/count_lakalanggar_polda_month");
const Lakalanggar_polres_month = require("../model/count_lakalanggar_polres_month");

const Master_lakalantas = require("../model/input_laka_lantas");
const Lakalantas_polda_day = require("../model/count_lakalantas_polda_day");
const Lakalantas_polda_month = require("../model/count_lakalantas_polda_month");
const Lakalantas_polres_month = require("../model/count_lakalantas_polres_month");

const Master_garlantas = require("../model/input_garlantas");
const Garlantas_polda_day = require("../model/count_garlantas_polda_day");
const Garlantas_polda_month = require("../model/count_garlantas_polda_month");
const Garlantas_polres_month = require("../model/count_garlantas_polres_month");

const Master_turjagwali = require("../model/input_turjagwali");
const Turjagwali_polda_day = require("../model/count_turjagwali_polda_day");
const Turjagwali_polda_month = require("../model/count_turjagwali_polda_month");
const Turjagwali_polres_month = require("../model/count_turjagwali_polres_month");

const Polda = require("../model/polda");
const Polres = require("../model/polres");

const decAes = (token) =>
  AESDecrypt(token, {
    isSafeUrl: true,
    parseMode: "string",
  });

module.exports = class DitgakkumController {
  static get_daily = async (req, res) => {
    try {
      const {
        start_date = null,
        end_date = null,
        filter = null,
        date = null,
        serverSide = null,
        length = null,
        start = null,
        polda_id = null,
        topPolda = null,
      } = req.query;

      const getDataRules = {
        group: [
          "polda.id",
          "garlantas.id",
          "laka_lantas.id",
          "turjagwali.id",
          "laka_langgar.id",
        ],
        attributes: ["id", "name_polda"],
        include: [
          {
            model: Garlantas_polda_day,
            required: false,
            as: "garlantas",
            attributes: [
              [
                Sequelize.literal(
                  "SUM(garlantas.pelanggaran_berat + garlantas.pelanggaran_ringan + garlantas.pelanggaran_sedang + garlantas.teguran)"
                ),
                "total_garlantas",
              ],
            ],
          },
          {
            model: Lakalantas_polda_day,
            required: false,
            as: "laka_lantas",
            attributes: [
              [
                Sequelize.literal("SUM(laka_lantas.insiden_kecelakaan)"),
                "total_lakalantas",
              ],
            ],
          },
          {
            model: Turjagwali_polda_day,
            required: false,
            as: "turjagwali",
            attributes: [
              [
                Sequelize.literal(
                  "SUM(turjagwali.pengawalan + turjagwali.penjagaan + turjagwali.patroli + turjagwali.pengaturan)"
                ),
                "total_turjagwali",
              ],
            ],
          },
          {
            model: Lakalanggar_polda_day,
            required: false,
            as: "laka_langgar",
            attributes: [
              [
                Sequelize.literal(
                  "SUM(laka_langgar.capture_camera + laka_langgar.statis + laka_langgar.posko + laka_langgar.mobile +  laka_langgar.online + laka_langgar.preemtif + laka_langgar.preventif + laka_langgar.odol_227 + laka_langgar.odol_307)"
                ),
                "total_lakalanggar",
              ],
            ],
          },
        ],
        nest: true,
        subQuery: false,
      };

      if (date) {
        for (let i = 0; i < getDataRules.include.length; i++) {
          getDataRules.include[i].where = {
            date: date,
          };
        }
      }

      if (filter) {
        for (let i = 0; i < getDataRules.include.length; i++) {
          getDataRules.include[i].where = {
            date: {
              [Op.between]: [start_date, end_date],
            },
          };
        }
      }

      if (polda_id) {
        getDataRules.where = {
          id: decAes(polda_id),
        };
      }

      if (serverSide?.toLowerCase() === "true") {
        getDataRules.limit = length;
        getDataRules.offset = start;
      }
      let finals = await Polda.findAll(getDataRules);

      let rows = [];
      for (let i = 0; i < finals.length; i++) {
        let data = finals[i].dataValues;
        var res_garlantas = 0;
        var res_lakalantas = 0;
        var res_turjagwali = 0;
        var res_lakalanggar = 0;
        for (let j = 0; j < data.garlantas.length; j++) {
          res_garlantas += parseInt(
            data.garlantas[j].dataValues.total_garlantas
          );
        }

        for (let j = 0; j < data.laka_lantas.length; j++) {
          res_lakalantas += parseInt(
            data.laka_lantas[j].dataValues.total_lakalantas
          );
        }

        for (let j = 0; j < data.turjagwali.length; j++) {
          res_turjagwali += parseInt(
            data.turjagwali[j].dataValues.total_turjagwali
          );
        }

        for (let j = 0; j < data.laka_langgar.length; j++) {
          res_lakalanggar += parseInt(
            data.laka_langgar[j].dataValues.total_lakalanggar
          );
        }

        rows.push({
          id: finals[i].dataValues.id,
          name_polda: finals[i].dataValues.name_polda,
          garlantas: res_garlantas || 0,
          lakalantas: res_lakalantas || 0,
          turjagwali: res_turjagwali || 0,
          lakalanggar: res_lakalanggar || 0,
          total:
            res_garlantas + res_lakalantas + res_turjagwali + res_lakalanggar,
        });
      }

      if (topPolda) {
        rows.sort((a, b) => b.total - a.total);
        rows = rows.slice(0, 10);
      }
      response(res, true, "Succeed", rows);
    } catch (error) {
      response(res, false, "Failed", error.message);
    }
  };

  static get_by_date = async (req, res) => {
    let start_of_month = moment().startOf("years").format("YYYY-MM-DD");
    let end_of_month = moment().endOf("years").format("YYYY-MM-DD");

    let start_of_day = moment().startOf("month").format("YYYY-MM-DD");
    let end_of_day = moment().endOf("month").format("YYYY-MM-DD");
    try {
      const {
        type = null,
        start_date = null,
        end_date = null,
        filter = null,
        date = null,
        serverSide = null,
        length = null,
        start = null,
        polda_id = null,
        topPolda = null,
      } = req.query;

      let wheres = {};
      let groups = "";
      let custom_attributes = "";

      var list_day = [];
      var list_month = [];
      var list_year = [];

      for (
        var m = moment(start_date);
        m.isSameOrBefore(end_date);
        m.add(1, "days")
      ) {
        list_day.push(m.format("YYYY-MM-DD"));
      }

      for (
        var m = moment(start_date);
        m.isSameOrBefore(end_date);
        m.add(1, "month")
      ) {
        list_month.push(m.format("MMMM"));
      }

      for (
        var m = moment(start_date);
        m.isSameOrBefore(end_date);
        m.add(1, "year")
      ) {
        list_year.push(m.format("YYYY"));
      }

      if (type === "day") {
        groups = "date";
        custom_attributes = "date";
      } else if (type === "month") {
        groups = "month";
        custom_attributes = [
          Sequelize.fn("date_trunc", "month", Sequelize.col("date")),
          "month",
        ];
      } else if (type === "year") {
        groups = "year";
        custom_attributes = [
          Sequelize.fn("date_trunc", "year", Sequelize.col("date")),
          "year",
        ];
      }

      if (filter) {
        wheres.date = {
          [Op.between]: [start_date, end_date],
        };
      }

      if (polda_id) {
        wheres.polda_id = decAes(polda_id);
      }

      let garlantas = await Garlantas_polda_day.findAll({
        group: groups,
        attributes: [
          custom_attributes,
          [
            Sequelize.literal(
              "SUM(pelanggaran_berat + pelanggaran_ringan + pelanggaran_sedang + teguran)"
            ),
            "total_garlantas",
          ],
        ],
        raw: true,
        where: wheres,
      });

      let lakalantas = await Lakalantas_polda_day.findAll({
        group: groups,
        attributes: [
          custom_attributes,
          [Sequelize.literal("SUM(insiden_kecelakaan)"), "total_lakalantas"],
        ],
        raw: true,
        where: wheres,
      });

      let turjagwali = await Turjagwali_polda_day.findAll({
        group: groups,
        attributes: [
          custom_attributes,
          [
            Sequelize.literal(
              "SUM(pengawalan + penjagaan + patroli + pengaturan)"
            ),
            "total_turjagwali",
          ],
        ],
        raw: true,
        where: wheres,
      });

      let lakalanggar = await Lakalanggar_polda_day.findAll({
        group: groups,
        attributes: [
          custom_attributes,
          [
            Sequelize.literal(
              "SUM(capture_camera + statis + posko + mobile +  online + preemtif + preventif + odol_227 + odol_307)"
            ),
            "total_lakalanggar",
          ],
        ],
        raw: true,
        where: wheres,
      });

      let finals = [];
      let arr_garlantas = [];
      let arr_lakalantas = [];
      let arr_lakalanggar = [];
      let arr_turjagwali = [];
      if (type === "day") {
        const asd = list_day.map((item, index) => {
          let garlantas_data = garlantas.find((x) => x.date == item);
          let lakalantas_data = lakalantas.find((x) => x.date == item);
          let lakalanggar_data = lakalanggar.find((x) => x.date == item);
          let turjagwali_data = turjagwali.find((x) => x.date == item);

          let obj = {};
          obj.date = item;
          if (garlantas_data) {
            obj.garlantas = parseInt(garlantas_data.total_garlantas);
          } else {
            obj.garlantas = 0;
          }

          if (lakalantas_data) {
            obj.lakalantas = parseInt(lakalantas_data.total_lakalantas);
          } else {
            obj.lakalantas = 0;
          }

          if (lakalanggar_data) {
            obj.lakalanggar = parseInt(lakalanggar_data.total_lakalanggar);
          } else {
            obj.lakalanggar = 0;
          }

          if (turjagwali_data) {
            obj.turjagwali = parseInt(turjagwali_data.total_turjagwali);
          } else {
            obj.turjagwali = 0;
          }
          finals.push(obj);
        });
      } else if (type === "month") {
        const asd = list_month.map((item, index) => {
          let garlantas_data = garlantas.find(
            (x) => moment(x.month).format("MMMM") == item
          );
          let lakalantas_data = lakalantas.find(
            (x) => moment(x.month).format("MMMM") == item
          );
          let lakalanggar_data = lakalanggar.find(
            (x) => moment(x.month).format("MMMM") == item
          );
          let turjagwali_data = turjagwali.find(
            (x) => moment(x.month).format("MMMM") == item
          );

          let obj = {};
          obj.date = item;
          if (garlantas_data) {
            obj.garlantas = parseInt(garlantas_data.total_garlantas);
          } else {
            obj.garlantas = 0;
          }

          if (lakalantas_data) {
            obj.lakalantas = parseInt(lakalantas_data.total_lakalantas);
          } else {
            obj.lakalantas = 0;
          }

          if (lakalanggar_data) {
            obj.lakalanggar = parseInt(lakalanggar_data.total_lakalanggar);
          } else {
            obj.lakalanggar = 0;
          }

          if (turjagwali_data) {
            obj.turjagwali = parseInt(turjagwali_data.total_turjagwali);
          } else {
            obj.turjagwali = 0;
          }
          finals.push(obj);
        });
      } else if (type === "year") {
        const asd = list_year.map((item, index) => {
          let garlantas_data = garlantas.find(
            (x) => moment(x.year).format("YYYY") == item
          );
          let lakalantas_data = lakalantas.find(
            (x) => moment(x.year).format("YYYY") == item
          );
          let lakalanggar_data = lakalanggar.find(
            (x) => moment(x.year).format("YYYY") == item
          );
          let turjagwali_data = turjagwali.find(
            (x) => moment(x.year).format("YYYY") == item
          );

          let obj = {};
          obj.date = item;
          if (garlantas_data) {
            obj.garlantas = parseInt(garlantas_data.total_garlantas);
          } else {
            obj.garlantas = 0;
          }

          if (lakalantas_data) {
            obj.lakalantas = parseInt(lakalantas_data.total_lakalantas);
          } else {
            obj.lakalantas = 0;
          }

          if (lakalanggar_data) {
            obj.lakalanggar = parseInt(lakalanggar_data.total_lakalanggar);
          } else {
            obj.lakalanggar = 0;
          }

          if (turjagwali_data) {
            obj.turjagwali = parseInt(turjagwali_data.total_turjagwali);
          } else {
            obj.turjagwali = 0;
          }
          finals.push(obj);
        });
      }

      response(res, true, "Succeed", finals);
    } catch (error) {
      response(res, false, "Failed", error.message);
    }
  };

  // static get = async (req, res) => {
  //   try {
  //     const { nasional, polda, polres, polda_id, polres_id } = req.query;
  //     let finalResponse = "";
  //     if (nasional) {
  //       let lakalanggar = await Lakalanggar_polda_month.findAll({
  //         include: [{ model: Polda, as: "polda" }],
  //       });

  //       let lakalantas = await Lakalantas_polda_month.findAll({
  //         include: [{ model: Polda, as: "polda" }],
  //       });

  //       let garlantas = await Garlantas_polda_month.findAll({
  //         include: [{ model: Polda, as: "polda" }],
  //       });

  //       let turjagwali = await Turjagwali_polda_month.findAll({
  //         include: [{ model: Polda, as: "polda" }],
  //       });

  //       let dataPolda = await Polda.findAll({
  //         attributes: ["id", "name_polda"],
  //       });

  //       let arrayResponse = [];
  //       const finalResult = [];
  //       const simResult = [];
  //       const stnkResult = [];
  //       const bpkbResult = [];
  //       const turjagwaliResult = [];

  //       let result_lakalanggar = Object.values(
  //         lakalanggar.reduce((a, { polda_id, ...props }) => {
  //           if (!a[polda_id])
  //             a[polda_id] = Object.assign({}, { polda_id, data: [props] });
  //           else a[polda_id].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_lakalanggar.forEach((item) => {
  //         var jumlah = 0;
  //         var name_polda = "";
  //         item.data.forEach((itm) => {
  //           name_polda = itm.dataValues.polda.name_polda;
  //           jumlah +=
  //             itm.dataValues.statis +
  //             itm.dataValues.mobile +
  //             itm.dataValues.capture_camera +
  //             itm.dataValues.posko +
  //             itm.dataValues.online +
  //             itm.dataValues.preemtif +
  //             itm.dataValues.preventif +
  //             itm.dataValues.odol_227 +
  //             itm.dataValues.odol_307;
  //         });
  //         finalResult.push({
  //           polda_id: item.polda_id,
  //           name_polda: name_polda,
  //           lakalanggar: jumlah,
  //         });
  //       });

  //       let result_lakalantas = Object.values(
  //         lakalantas.reduce((a, { polda_id, ...props }) => {
  //           if (!a[polda_id])
  //             a[polda_id] = Object.assign({}, { polda_id, data: [props] });
  //           else a[polda_id].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_lakalantas.forEach((item) => {
  //         var name_polda = "";
  //         var jumlah = 0;
  //         item.data.forEach((itm) => {
  //           name_polda = itm.dataValues.polda.name_polda;
  //           jumlah +=
  //             itm.dataValues.meninggal_dunia +
  //             itm.dataValues.luka_berat +
  //             itm.dataValues.luka_ringan +
  //             itm.dataValues.kerugian_material;
  //         });
  //         finalResult.push({
  //           polda_id: item.polda_id,
  //           name_polda: name_polda,
  //           lakalantas: jumlah,
  //         });
  //       });

  //       let result_garlantas = Object.values(
  //         garlantas.reduce((a, { polda_id, ...props }) => {
  //           if (!a[polda_id])
  //             a[polda_id] = Object.assign({}, { polda_id, data: [props] });
  //           else a[polda_id].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_garlantas.forEach((item) => {
  //         var jumlah = 0;
  //         var name_polda = "";
  //         item.data.forEach((itm) => {
  //           name_polda = itm.dataValues.polda.name_polda;
  //           jumlah +=
  //             itm.dataValues.pelanggaran_berat +
  //             itm.dataValues.pelanggaran_ringan +
  //             itm.dataValues.pelanggaran_sedang +
  //             itm.dataValues.teguran;
  //         });
  //         finalResult.push({
  //           polda_id: item.polda_id,
  //           name_polda: name_polda,
  //           garlantas: jumlah,
  //         });
  //       });

  //       let result_turjagwali = Object.values(
  //         turjagwali.reduce((a, { polda_id, ...props }) => {
  //           if (!a[polda_id])
  //             a[polda_id] = Object.assign({}, { polda_id, data: [props] });
  //           else a[polda_id].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_turjagwali.forEach((item) => {
  //         var jumlah = 0;
  //         var name_polda = "";
  //         item.data.forEach((itm) => {
  //           name_polda = itm.dataValues.polda.name_polda;
  //           jumlah +=
  //             itm.dataValues.pengaturan +
  //             itm.dataValues.penjagaan +
  //             itm.dataValues.patroli +
  //             itm.dataValues.pengawalan;
  //         });
  //         finalResult.push({
  //           polda_id: item.polda_id,
  //           name_polda: name_polda,
  //           turjagwali: jumlah,
  //         });
  //       });

  //       let result = Object.values(
  //         finalResult.reduce((a, { polda_id, ...props }) => {
  //           if (!a[polda_id])
  //             a[polda_id] = Object.assign({}, { polda_id, data: [props] });
  //           else a[polda_id].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       let k = [];
  //       result.forEach((res, index) => {
  //         var lakalanggar = 0;
  //         var lakalantas = 0;
  //         var garlantas = 0;
  //         var name_polda = 0;
  //         var turjagwali = 0;
  //         res.data.forEach((element) => {
  //           console.log(element);
  //           lakalanggar += element.lakalanggar || 0;
  //           lakalantas += element.lakalantas || 0;
  //           garlantas += element.garlantas || 0;
  //           turjagwali += element.turjagwali || 0;
  //           name_polda = element.name_polda;
  //         });
  //         k.push({
  //           polda_id: res.polda_id,
  //           name_polda: name_polda,
  //           lakalanggar: lakalanggar,
  //           lakalantas: lakalantas,
  //           turjagwali: turjagwali,
  //           garlantas: garlantas,
  //         });
  //       });

  //       dataPolda.map((Element, index) => {
  //         let a = k.find((x) => {
  //           return x.polda_id == Element.dataValues.id;
  //         });

  //         if (!a) {
  //           k.push({
  //             polda_id: Element.dataValues.id,
  //             name_polda: Element.dataValues.name_polda,
  //             lakalanggar: 0,
  //             lakalantas: 0,
  //             garlantas: 0,
  //             turjagwali: 0,
  //           });
  //         }
  //       });

  //       finalResponse = k;
  //     }

  //     if (polda) {
  //       let lakalanggar = await Lakalanggar_polres_month.findAll({
  //         include: [
  //           { model: Polda, as: "polda" },
  //           { model: Polres, as: "polres" },
  //         ],
  //         where: {
  //           polda_id: decAes(polda_id),
  //         },
  //       });

  //       let lakalantas = await Lakalantas_polres_month.findAll({
  //         include: [
  //           { model: Polda, as: "polda" },
  //           { model: Polres, as: "polres" },
  //         ],
  //         where: {
  //           polda_id: decAes(polda_id),
  //         },
  //       });

  //       let garlantas = await Garlantas_polres_month.findAll({
  //         include: [
  //           { model: Polda, as: "polda" },
  //           { model: Polres, as: "polres" },
  //         ],
  //         where: {
  //           polda_id: decAes(polda_id),
  //         },
  //       });

  //       let turjagwali = await Turjagwali_polres_month.findAll({
  //         include: [
  //           { model: Polda, as: "polda" },
  //           { model: Polres, as: "polres" },
  //         ],
  //         where: {
  //           polda_id: decAes(polda_id),
  //         },
  //       });

  //       let dataPolres = await Polres.findAll({
  //         attributes: ["id", "name_polres", "polda_id"],
  //         where: {
  //           polda_id: decAes(polda_id),
  //         },
  //       });

  //       let arrayResponse = [];
  //       const finalResult = [];
  //       const lakalanggarResult = [];
  //       const lakalantasResult = [];
  //       const garlantasResult = [];
  //       const turjagwaliResult = [];

  //       let result_lakalanggar = Object.values(
  //         lakalanggar.reduce((a, { polres_id, ...props }) => {
  //           if (!a[polres_id])
  //             a[polres_id] = Object.assign({}, { polres_id, data: [props] });
  //           else a[polres_id].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_lakalanggar.forEach((item) => {
  //         var jumlah = 0;
  //         var name_polres = "";
  //         item.data.forEach((itm) => {
  //           name_polres = itm.dataValues.polres.name_polres;
  //           jumlah +=
  //             itm.dataValues.statis +
  //             itm.dataValues.mobile +
  //             itm.dataValues.capture_camera +
  //             itm.dataValues.posko +
  //             itm.dataValues.online +
  //             itm.dataValues.preemtif +
  //             itm.dataValues.preventif +
  //             itm.dataValues.odol_227 +
  //             itm.dataValues.odol_307;
  //         });
  //         finalResult.push({
  //           polres_id: item.polres_id,
  //           name_polres: name_polres,
  //           lakalanggar: jumlah,
  //         });
  //       });

  //       let result_lakalantas = Object.values(
  //         lakalantas.reduce((a, { polres_id, ...props }) => {
  //           if (!a[polres_id])
  //             a[polres_id] = Object.assign({}, { polres_id, data: [props] });
  //           else a[polres_id].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_lakalantas.forEach((item) => {
  //         var name_polres = "";
  //         var jumlah = 0;
  //         item.data.forEach((itm) => {
  //           name_polres = itm.dataValues.polres.name_polres;
  //           jumlah +=
  //             itm.dataValues.meninggal_dunia +
  //             itm.dataValues.luka_berat +
  //             itm.dataValues.luka_ringan +
  //             itm.dataValues.kerugian_material;
  //         });
  //         finalResult.push({
  //           polres_id: item.polres_id,
  //           name_polres: name_polres,
  //           lakalantas: jumlah,
  //         });
  //       });

  //       let result_garlantas = Object.values(
  //         garlantas.reduce((a, { polres_id, ...props }) => {
  //           if (!a[polres_id])
  //             a[polres_id] = Object.assign({}, { polres_id, data: [props] });
  //           else a[polres_id].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_garlantas.forEach((item) => {
  //         var jumlah = 0;
  //         var name_polres = "";
  //         item.data.forEach((itm) => {
  //           name_polres = itm.dataValues.polres.name_polres;
  //           jumlah +=
  //             itm.dataValues.pelanggaran_berat +
  //             itm.dataValues.pelanggaran_ringan +
  //             itm.dataValues.pelanggaran_sedang +
  //             itm.dataValues.teguran
  //         });
  //         finalResult.push({
  //           polres_id: item.polres_id,
  //           name_polres: name_polres,
  //           garlantas: jumlah,
  //         });
  //       });

  //       let result_turjagwali = Object.values(
  //         turjagwali.reduce((a, { polres_id, ...props }) => {
  //           if (!a[polres_id])
  //             a[polres_id] = Object.assign({}, { polres_id, data: [props] });
  //           else a[polres_id].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_turjagwali.forEach((item) => {
  //         var jumlah = 0;
  //         var name_polres = "";
  //         item.data.forEach((itm) => {
  //           name_polres = itm.dataValues.polres.name_polres;
  //           jumlah +=
  //             itm.dataValues.pengaturan +
  //             itm.dataValues.penjagaan +
  //             itm.dataValues.patroli +
  //             itm.dataValues.pengawalan;
  //         });
  //         finalResult.push({
  //           polres_id: item.polres_id,
  //           name_polres: name_polres,
  //           turjagwali: jumlah,
  //         });
  //       });

  //       let result = Object.values(
  //         finalResult.reduce((a, { polres_id, ...props }) => {
  //           if (!a[polres_id])
  //             a[polres_id] = Object.assign({}, { polres_id, data: [props] });
  //           else a[polres_id].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       let k = [];
  //       result.forEach((res, index) => {
  //         var lakalantas = 0;
  //         var lakalanggar = 0;
  //         var garlantas = 0;
  //         var name_polres = "";
  //         var turjagwali = 0;
  //         res.data.forEach((element) => {
  //           lakalantas += element.lakalantas || 0;
  //           lakalanggar += element.lakalanggar || 0;
  //           garlantas += element.garlantas || 0;
  //           turjagwali += element.turjagwali || 0;
  //           name_polres = element.name_polres;
  //         });
  //         k.push({
  //           polres_id: res.polres_id,
  //           name_polres: name_polres,
  //           lakalantas: lakalantas,
  //           lakalanggar: lakalanggar,
  //           turjagwali: turjagwali,
  //           garlantas: garlantas,
  //         });
  //       });

  //       dataPolres.map((Element, index) => {
  //         let a = k.find((x) => {
  //           return x.polres_id == Element.dataValues.id;
  //         });

  //         if (!a) {
  //           k.push({
  //             polres_id: Element.dataValues.id,
  //             name_polres: Element.dataValues.name_polres,
  //             lakalantas: 0,
  //             lakalanggar: 0,
  //             garlantas: 0,
  //             turjagwali: 0,
  //           });
  //         }
  //       });

  //       finalResponse = k;
  //     }

  //     if (polres) {
  //       let lakalanggar = await Lakalanggar_polres_month.findAll({
  //         include: [{ model: Polres, as: "polres" }],
  //         where: {
  //           polres_id: decAes(polres_id) ,
  //         },
  //       });

  //       let lakalantas = await Lakalantas_polres_month.findAll({
  //         include: [{ model: Polres, as: "polres" }],
  //         where: {
  //           polres_id: decAes(polres_id),
  //         },
  //       });

  //       let garlantas = await Garlantas_polres_month.findAll({
  //         include: [{ model: Polres, as: "polres" }],
  //         where: {
  //           polres_id: decAes(polres_id),
  //         },
  //       });

  //       let turjagwali = await Turjagwali_polres_month.findAll({
  //         include: [{ model: Polres, as: "polres" }],
  //         where: {
  //           polres_id: decAes(polres_id),
  //         },
  //       });

  //       let reduce_lakalanggar = lakalanggar.reduce((prevVal, currVal) => {
  //         Object.keys(currVal.dataValues).forEach(function (key) {
  //           if (
  //             key === "polda_id" ||
  //             key === "polres_id" ||
  //             key === "date" ||
  //             key === "id" ||
  //             key === "created_at" ||
  //             key === "updated_at" ||
  //             key === "deleted_at" ||
  //             key === "polres"
  //           ) {
  //           } else {
  //             prevVal[key] = (prevVal[key] || 0) + currVal[key];
  //           }
  //         });
  //         return prevVal;
  //       }, {});

  //       let jumlah_lakalanggar = Object.values(reduce_lakalanggar).reduce(
  //         (a, b) => {
  //           return a + b;
  //         },
  //         0
  //       );

  //       let reduce_lakalantas = lakalantas.reduce((prevVal, currVal) => {
  //         Object.keys(currVal.dataValues).forEach(function (key) {
  //           if (
  //             key === "polda_id" ||
  //             key === "polres_id" ||
  //             key === "date" ||
  //             key === "id" ||
  //             key === "created_at" ||
  //             key === "updated_at" ||
  //             key === "deleted_at" ||
  //             key === "polres"
  //           ) {
  //           } else {
  //             prevVal[key] = (prevVal[key] || 0) + currVal[key];
  //           }
  //         });
  //         return prevVal;
  //       }, {});

  //       let jumlah_lakalantas = Object.values(reduce_lakalantas).reduce(
  //         (a, b) => {
  //           return a + b;
  //         },
  //         0
  //       );

  //       let reduce_garlantas = garlantas.reduce((prevVal, currVal) => {
  //         Object.keys(currVal.dataValues).forEach(function (key) {
  //           if (
  //             key === "polda_id" ||
  //             key === "polres_id" ||
  //             key === "date" ||
  //             key === "id" ||
  //             key === "created_at" ||
  //             key === "updated_at" ||
  //             key === "deleted_at" ||
  //             key === "polres"
  //           ) {
  //           } else {
  //             prevVal[key] = (prevVal[key] || 0) + currVal[key];
  //           }
  //         });
  //         return prevVal;
  //       }, {});

  //       let jumlah_garlantas = Object.values(reduce_garlantas).reduce(
  //         (a, b) => {
  //           return a + b;
  //         },
  //         0
  //       );

  //       let reduce_turjagwali = turjagwali.reduce((prevVal, currVal) => {
  //         Object.keys(currVal.dataValues).forEach(function (key) {
  //           if (
  //             key === "polda_id" ||
  //             key === "polres_id" ||
  //             key === "date" ||
  //             key === "id" ||
  //             key === "created_at" ||
  //             key === "updated_at" ||
  //             key === "deleted_at" ||
  //             key === "polres"
  //           ) {
  //           } else {
  //             prevVal[key] = (prevVal[key] || 0) + currVal[key];
  //           }
  //         });
  //         return prevVal;
  //       }, {});

  //       let jumlah_turjagwali = Object.values(reduce_turjagwali).reduce(
  //         (a, b) => {
  //           return a + b;
  //         },
  //         0
  //       );

  //       finalResponse = {
  //         turjagwali: jumlah_turjagwali,
  //         garlantas: jumlah_garlantas,
  //         lakalanggar: jumlah_lakalanggar,
  //         lakalantas: jumlah_lakalantas,
  //       };
  //     }
  //     //   const query = `
  //     //             SELECT a.name_polda
  //     //                 , (SELECT baru FROM count_sim_polda_month cspm WHERE cspm.date='2022-10-31' AND cspm.polda_id=a.id) AS sim_baru
  //     //                 , (SELECT perpanjangan FROM count_sim_polda_month cspm WHERE cspm.date='2022-10-31' AND cspm.polda_id=a.id) AS sim_perpanjangan
  //     //                 ,
  //     //             FROM polda a

  //     //     `;
  //     //   let [dataPoldaSim] = await db.query(query);
  //     response(res, true, "Succeed", finalResponse);
  //   } catch (error) {
  //     response(res, false, "Failed", error.message);
  //   }
  // };
  // static getData = async (req, res) => {
  //   try {
  //     const query = `
  //               SELECT a.name_polda
  //                   , (SELECT baru FROM count_sim_polda_month cspm WHERE cspm.date='2022-10-31' AND cspm.polda_id=a.id) AS sim_baru
  //                   , (SELECT perpanjangan FROM count_sim_polda_month cspm WHERE cspm.date='2022-10-31' AND cspm.polda_id=a.id) AS sim_perpanjangan
  //               FROM polda a

  //       `;
  //   } catch (error) {}
  // };
  // static countByMonth = async (req, res) => {
  //   try {
  //     const { nasional, polda, polres, polda_id, polres_id } = req.query;
  //     const dataMonth = [
  //       "January",
  //       "February",
  //       "March",
  //       "April",
  //       "Mei",
  //       "June",
  //       "July",
  //       "August",
  //       "September",
  //       "October",
  //       "November",
  //       "December",
  //     ];
  //     let finalResponse = "";

  //     if (nasional) {
  //       let lakalanggar = await Lakalanggar_polda_month.findAll({
  //         include: [{ model: Polda, as: "polda" }],
  //       });

  //       let lakalantas = await Lakalantas_polda_month.findAll({
  //         include: [{ model: Polda, as: "polda" }],
  //       });

  //       let garlantas = await Garlantas_polda_month.findAll({
  //         include: [{ model: Polda, as: "polda" }],
  //       });

  //       let turjagwali = await Turjagwali_polda_month.findAll({
  //         include: [{ model: Polda, as: "polda" }],
  //       });

  //       let arrayResponse = [];
  //       const finalResult = [];
  //       const lakalanggarResult = [];
  //       const lakalantasResult = [];
  //       const garlantasResult = [];
  //       const turjagwaliResult = [];

  //       let result_lakalanggar = Object.values(
  //         lakalanggar.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_lakalanggar.forEach((item) => {
  //         var jumlah = 0;
  //         var date = "";
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           jumlah +=
  //             itm.dataValues.statis +
  //             itm.dataValues.mobile +
  //             itm.dataValues.capture_camera +
  //             itm.dataValues.posko +
  //             itm.dataValues.online +
  //             itm.dataValues.preemtif +
  //             itm.dataValues.preventif +
  //             itm.dataValues.odol_227 +
  //             itm.dataValues.odol_307;;
  //         });
  //         finalResult.push({
  //           date: moment(date).format("MMMM"),
  //           lakalanggar: jumlah,
  //         });
  //       });

  //       let result_lakalantas = Object.values(
  //         lakalantas.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_lakalantas.forEach((item) => {
  //         var date = "";
  //         var jumlah = 0;
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           jumlah +=
  //             itm.dataValues.meninggal_dunia +
  //             itm.dataValues.luka_berat +
  //             itm.dataValues.luka_ringan +
  //             itm.dataValues.kerugian_material
  //         });
  //         finalResult.push({
  //           date: moment(date).format("MMMM"),
  //           lakalantas: jumlah,
  //         });
  //       });

  //       let result_garlantas = Object.values(
  //         garlantas.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_garlantas.forEach((item) => {
  //         var jumlah = 0;
  //         var date = "";
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           jumlah +=
  //             itm.dataValues.pelanggaran_berat +
  //             itm.dataValues.pelanggaran_ringan +
  //             itm.dataValues.pelanggaran_sedang +
  //             itm.dataValues.teguran
  //         });
  //         finalResult.push({
  //           date: moment(date).format("MMMM"),
  //           garlantas: jumlah,
  //         });
  //       });

  //       let result_turjagwali = Object.values(
  //         turjagwali.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_turjagwali.forEach((item) => {
  //         var jumlah = 0;
  //         var date = "";
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           jumlah +=
  //             itm.dataValues.pengaturan +
  //             itm.dataValues.penjagaan +
  //             itm.dataValues.patroli +
  //             itm.dataValues.pengawalan;
  //         });
  //         finalResult.push({
  //           date: moment(date).format("MMMM"),
  //           turjagwali: jumlah,
  //         });
  //       });

  //       let result = Object.values(
  //         finalResult.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       let k = [];
  //       result.forEach((res, index) => {
  //         var lakalantas = 0;
  //         var lakalanggar = 0;
  //         var garlantas = 0;
  //         var date = "";
  //         var turjagwali = 0;
  //         res.data.forEach((element) => {
  //           lakalantas += element.lakalantas || 0;
  //           lakalanggar += element.lakalanggar || 0;
  //           garlantas += element.garlantas || 0;
  //           turjagwali += element.turjagwali || 0;
  //           date = res.date;
  //         });
  //         k.push({
  //           date: date,
  //           lakalantas: lakalantas,
  //           lakalanggar: lakalanggar,
  //           turjagwali: turjagwali,
  //           garlantas: garlantas,
  //         });
  //       });

  //       dataMonth.map((Element, index) => {
  //         let a = k.find((x) => {
  //           return x.date == Element;
  //         });

  //         if (!a) {
  //           k.push({
  //             date: Element,
  //             lakalantas: 0,
  //             lakalanggar: 0,
  //             garlantas: 0,
  //             turjagwali: 0,
  //           });
  //         }
  //       });

  //       finalResponse = k;
  //     }

  //     if (polda) {
  //       let lakalanggar = await Lakalanggar_polres_month.findAll({
  //         include: [
  //           { model: Polda, as: "polda" },
  //           { model: Polres, as: "polres" },
  //         ],
  //         where: {
  //           polda_id: polda_id,
  //         },
  //       });

  //       let lakalantas = await Lakalantas_polres_month.findAll({
  //         include: [
  //           { model: Polda, as: "polda" },
  //           { model: Polres, as: "polres" },
  //         ],
  //         where: {
  //           polda_id: polda_id,
  //         },
  //       });

  //       let garlantas = await Garlantas_polres_month.findAll({
  //         include: [
  //           { model: Polda, as: "polda" },
  //           { model: Polres, as: "polres" },
  //         ],
  //         where: {
  //           polda_id: polda_id,
  //         },
  //       });

  //       let turjagwali = await Turjagwali_polres_month.findAll({
  //         include: [
  //           { model: Polda, as: "polda" },
  //           { model: Polres, as: "polres" },
  //         ],
  //         where: {
  //           polda_id: polda_id,
  //         },
  //       });

  //       let dataPolres = await Polres.findAll({
  //         attributes: ["id", "name_polres", "polda_id"],
  //         where: {
  //           polda_id: polda_id,
  //         },
  //       });

  //       let arrayResponse = [];
  //       const finalResult = [];
  //       const lakalanggarResult = [];
  //       const lakalantasResult = [];
  //       const garlantasResult = [];
  //       const turjagwaliResult = [];

  //       let result_lakalanggar = Object.values(
  //         lakalanggar.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_lakalanggar.forEach((item) => {
  //         var jumlah = 0;
  //         var date = "";
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           jumlah +=
  //             itm.dataValues.statis +
  //             itm.dataValues.mobile +
  //             itm.dataValues.capture_camera +
  //             itm.dataValues.posko +
  //             itm.dataValues.online +
  //             itm.dataValues.preemtif +
  //             itm.dataValues.preventif +
  //             itm.dataValues.odol_227 +
  //             itm.dataValues.odol_307;
  //         });
  //         finalResult.push({
  //           date: moment(date).format("MMMM"),
  //           lakalanggar: jumlah,
  //         });
  //       });

  //       let result_lakalantas = Object.values(
  //         lakalantas.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_lakalantas.forEach((item) => {
  //         var date = "";
  //         var jumlah = 0;
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           jumlah +=
  //             itm.dataValues.meninggal_dunia +
  //             itm.dataValues.luka_berat +
  //             itm.dataValues.luka_ringan +
  //             itm.dataValues.kerugian_material
  //         });
  //         finalResult.push({
  //           date: moment(date).format("MMMM"),
  //           lakalantas: jumlah,
  //         });
  //       });

  //       let result_garlantas = Object.values(
  //         garlantas.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_garlantas.forEach((item) => {
  //         var jumlah = 0;
  //         var date = "";
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           jumlah +=
  //             itm.dataValues.pelanggaran_berat +
  //             itm.dataValues.pelanggaran_ringan +
  //             itm.dataValues.pelanggaran_sedang +
  //             itm.dataValues.teguran
  //         });
  //         finalResult.push({
  //           date: moment(date).format("MMMM"),
  //           garlantas: jumlah,
  //         });
  //       });

  //       let result_turjagwali = Object.values(
  //         turjagwali.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_turjagwali.forEach((item) => {
  //         var jumlah = 0;
  //         var date = "";
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           jumlah +=
  //             itm.dataValues.pengaturan +
  //             itm.dataValues.penjagaan +
  //             itm.dataValues.patroli +
  //             itm.dataValues.pengawalan;
  //         });
  //         finalResult.push({
  //           date: moment(date).format("MMMM"),
  //           turjagwali: jumlah,
  //         });
  //       });

  //       let result = Object.values(
  //         finalResult.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       let k = [];
  //       result.forEach((res, index) => {
  //         var lakalantas = 0;
  //         var lakalanggar = 0;
  //         var garlantas = 0;
  //         var date = "";
  //         var turjagwali = 0;
  //         res.data.forEach((element) => {
  //           lakalantas += element.lakalantas || 0;
  //           lakalanggar += element.lakalanggar || 0;
  //           garlantas += element.garlantas || 0;
  //           turjagwali += element.turjagwali || 0;
  //           date = res.date;
  //         });
  //         k.push({
  //           date: date,
  //           lakalantas: lakalantas,
  //           lakalanggar: lakalanggar,
  //           turjagwali: turjagwali,
  //           garlantas: garlantas,
  //         });
  //       });

  //       dataMonth.map((Element, index) => {
  //         let a = k.find((x) => {
  //           return x.date == Element;
  //         });

  //         if (!a) {
  //           k.push({
  //             date: Element,
  //             lakalantas: 0,
  //             lakalanggar: 0,
  //             garlantas: 0,
  //             turjagwali: 0,
  //           });
  //         }
  //       });

  //       finalResponse = k;
  //     }

  //     if (polres) {
  //       let lakalanggar = await Lakalanggar_polres_month.findAll({
  //         include: [{ model: Polres, as: "polres" }],
  //         where: {
  //           polres_id: polres_id,
  //         },
  //       });

  //       let lakalantas = await Lakalantas_polres_month.findAll({
  //         include: [{ model: Polres, as: "polres" }],
  //         where: {
  //           polres_id: polres_id,
  //         },
  //       });

  //       let garlantas = await Garlantas_polres_month.findAll({
  //         include: [{ model: Polres, as: "polres" }],
  //         where: {
  //           polres_id: polres_id,
  //         },
  //       });

  //       let turjagwali = await Turjagwali_polres_month.findAll({
  //         include: [{ model: Polres, as: "polres" }],
  //         where: {
  //           polres_id: polres_id,
  //         },
  //       });

  //       let arrayResponse = [];
  //       const finalResult = [];
  //       const lakalanggarResult = [];
  //       const lakalantasResult = [];
  //       const garlantasResult = [];
  //       const turjagwaliResult = [];

  //       let result_lakalanggar = Object.values(
  //         lakalanggar.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_lakalanggar.forEach((item) => {
  //         var jumlah = 0;
  //         var date = "";
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           jumlah +=
  //             itm.dataValues.statis +
  //             itm.dataValues.mobile +
  //             itm.dataValues.capture_camera +
  //             itm.dataValues.posko +
  //             itm.dataValues.online +
  //             itm.dataValues.preemtif +
  //             itm.dataValues.preventif +
  //             itm.dataValues.odol_227 +
  //             itm.dataValues.odol_307;
  //         });
  //         finalResult.push({
  //           date: moment(date).format("MMMM"),
  //           lakalanggar: jumlah,
  //         });
  //       });

  //       let result_lakalantas = Object.values(
  //         lakalantas.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_lakalantas.forEach((item) => {
  //         var date = "";
  //         var jumlah = 0;
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           jumlah +=
  //             itm.dataValues.meninggal_dunia +
  //             itm.dataValues.luka_berat +
  //             itm.dataValues.luka_ringan +
  //             itm.dataValues.kerugian_material
  //         });
  //         finalResult.push({
  //           date: moment(date).format("MMMM"),
  //           lakalantas: jumlah,
  //         });
  //       });

  //       let result_garlantas = Object.values(
  //         garlantas.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_garlantas.forEach((item) => {
  //         var jumlah = 0;
  //         var date = "";
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           jumlah +=
  //             itm.dataValues.pelanggaran_berat +
  //             itm.dataValues.pelanggaran_ringan +
  //             itm.dataValues.pelanggaran_sedang +
  //             itm.dataValues.teguran
  //         });
  //         finalResult.push({
  //           date: moment(date).format("MMMM"),
  //           garlantas: jumlah,
  //         });
  //       });

  //       let result_turjagwali = Object.values(
  //         turjagwali.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_turjagwali.forEach((item) => {
  //         var jumlah = 0;
  //         var date = "";
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           jumlah +=
  //             itm.dataValues.pengaturan +
  //             itm.dataValues.penjagaan +
  //             itm.dataValues.patroli +
  //             itm.dataValues.pengawalan;
  //         });
  //         finalResult.push({
  //           date: moment(date).format("MMMM"),
  //           turjagwali: jumlah,
  //         });
  //       });

  //       let result = Object.values(
  //         finalResult.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       let k = [];
  //       result.forEach((res, index) => {
  //         var lakalantas = 0;
  //         var lakalanggar = 0;
  //         var garlantas = 0;
  //         var date = "";
  //         var turjagwali = 0;
  //         res.data.forEach((element) => {
  //           lakalantas += element.lakalantas || 0;
  //           lakalanggar += element.lakalanggar || 0;
  //           garlantas += element.garlantas || 0;
  //           turjagwali += element.turjagwali || 0;
  //           date = res.date;
  //         });
  //         k.push({
  //           date: date,
  //           lakalantas: lakalantas,
  //           lakalanggar: lakalanggar,
  //           turjagwali: turjagwali,
  //           garlantas: garlantas,
  //         });
  //       });

  //       dataMonth.map((Element, index) => {
  //         let a = k.find((x) => {
  //           return x.date == Element;
  //         });

  //         if (!a) {
  //           k.push({
  //             date: Element,
  //             lakalantas: 0,
  //             lakalanggar: 0,
  //             garlantas: 0,
  //             turjagwali: 0,
  //           });
  //         }
  //       });

  //       finalResponse = k;
  //     }
  //     response(res, true, "Succeed", finalResponse);
  //   } catch (error) {
  //     response(res, false, "Failed", error.message);
  //   }
  // };
};
