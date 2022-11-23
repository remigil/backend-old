const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const { Op, Sequelize, where } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");

const Master_dikmaslantas = require("../model/input_dikmaslantas");
const Dikmaslantas_polda_day = require("../model/count_dikmaslantas_polda_day");
const Dikmaslantas_polda_month = require("../model/count_dikmaslantas_polda_month");
const Dikmaslantas_polres_month = require("../model/count_dikmaslantas_polres_month");

const Master_penyebaran = require("../model/input_penyebaran");
const Penyebaran_polda_day = require("../model/count_penyebaran_polda_day");
const Penyebaran_polda_month = require("../model/count_penyebaran_polda_month");
const Penyebaran_polres_month = require("../model/count_penyebaran_polres_month");

const Polda = require("../model/polda");
const Polres = require("../model/polres");

const decAes = (token) =>
  AESDecrypt(token, {
    isSafeUrl: true,
    parseMode: "string",
  });

module.exports = class DitkamselController {
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
        group: ["polda.id", "dikmaslantas.id", "penyebaran.id"],
        attributes: ["id", "name_polda"],
        include: [
          {
            model: Dikmaslantas_polda_day,
            required: false,
            as: "dikmaslantas",
            attributes: [
              [
                Sequelize.literal(
                  "SUM(dikmaslantas.media_elektronik + dikmaslantas.media_sosial + dikmaslantas.media_cetak + dikmaslantas.laka_langgar)"
                ),
                "total_dikmaslantas",
              ],
            ],
          },
          {
            model: Penyebaran_polda_day,
            required: false,
            as: "penyebaran",
            attributes: [
              [
                Sequelize.literal(
                  "SUM(penyebaran.stiker + penyebaran.spanduk + penyebaran.leaflet + penyebaran.billboard + penyebaran.jemensosprek)"
                ),
                "total_penyebaran",
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
        var res_dikmaslantas = 0;
        var res_penyebaran = 0;

        for (let j = 0; j < data.dikmaslantas.length; j++) {
          res_dikmaslantas += parseInt(
            data.dikmaslantas[j].dataValues.total_dikmaslantas
          );
        }

        for (let j = 0; j < data.penyebaran.length; j++) {
          res_penyebaran += parseInt(
            data.penyebaran[j].dataValues.total_penyebaran
          );
        }

        rows.push({
          id: finals[i].dataValues.id,
          name_polda: finals[i].dataValues.name_polda,
          dikmaslantas: res_dikmaslantas || 0,
          penyebaran: res_penyebaran || 0,
          total: res_dikmaslantas + res_penyebaran,
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

      let dikmaslantas = await Dikmaslantas_polda_day.findAll({
        group: groups,
        attributes: [
          custom_attributes,
          [
            Sequelize.literal(
              "SUM(media_elektronik + media_sosial + media_cetak + laka_langgar)"
            ),
            "total_dikmaslantas",
          ],
        ],
        raw: true,
        where: wheres,
      });

      let penyebaran = await Penyebaran_polda_day.findAll({
        group: groups,
        attributes: [
          custom_attributes,
          [
            Sequelize.literal(
              "SUM(stiker + spanduk + leaflet + billboard + jemensosprek)"
            ),
            "total_penyebaran",
          ],
        ],
        raw: true,
        where: wheres,
      });

      let finals = [];
      let arr_dikmaslantas = [];
      let arr_penyebaran = [];

      if (type === "day") {
        const asd = list_day.map((item, index) => {
          let dikmaslantas_data = dikmaslantas.find((x) => x.date == item);
          let penyebaran_data = penyebaran.find((x) => x.date == item);

          let obj = {};
          obj.date = item;
          if (dikmaslantas_data) {
            obj.dikmaslantas = parseInt(dikmaslantas_data.total_dikmaslantas);
          } else {
            obj.dikmaslantas = 0;
          }

          if (penyebaran_data) {
            obj.penyebaran = parseInt(penyebaran_data.total_penyebaran);
          } else {
            obj.penyebaran = 0;
          }
          finals.push(obj);
        });
      } else if (type === "month") {
        const asd = list_month.map((item, index) => {
          let dikmaslantas_data = dikmaslantas.find(
            (x) => moment(x.month).format("MMMM") == item
          );
          let penyebaran_data = penyebaran.find(
            (x) => moment(x.month).format("MMMM") == item
          );

          let obj = {};
          obj.date = item;
          if (dikmaslantas_data) {
            obj.dikmaslantas = parseInt(dikmaslantas_data.total_dikmaslantas);
          } else {
            obj.dikmaslantas = 0;
          }

          if (penyebaran_data) {
            obj.penyebaran = parseInt(penyebaran_data.total_penyebaran);
          } else {
            obj.penyebaran = 0;
          }
          finals.push(obj);
        });
      } else if (type === "year") {
        const asd = list_year.map((item, index) => {
          let dikmaslantas_data = dikmaslantas.find(
            (x) => moment(x.month).format("YYYY") == item
          );
          let penyebaran_data = penyebaran.find(
            (x) => moment(x.month).format("YYYY") == item
          );

          let obj = {};
          obj.date = item;
          if (dikmaslantas_data) {
            obj.dikmaslantas = parseInt(dikmaslantas_data.total_dikmaslantas);
          } else {
            obj.dikmaslantas = 0;
          }

          if (penyebaran_data) {
            obj.penyebaran = parseInt(penyebaran_data.total_penyebaran);
          } else {
            obj.penyebaran = 0;
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
  //       let dikmaslantas = await Dikmaslantas_polda_month.findAll({
  //         include: [{ model: Polda, as: "polda" }],
  //       });

  //       let penyebaran = await Penyebaran_polda_month.findAll({
  //         include: [{ model: Polda, as: "polda" }],
  //       });

  //       let dataPolda = await Polda.findAll({
  //         attributes: ["id", "name_polda"],
  //       });

  //       let arrayResponse = [];
  //       const finalResult = [];
  //       const dikmaslantasResult = [];
  //       const penyebaranResult = [];
  //       let result_dikmaslantas = Object.values(
  //         dikmaslantas.reduce((a, { polda_id, ...props }) => {
  //           if (!a[polda_id])
  //             a[polda_id] = Object.assign({}, { polda_id, data: [props] });
  //           else a[polda_id].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_dikmaslantas.forEach((item) => {
  //         var jumlah = 0;
  //         var name_polda = "";
  //         item.data.forEach((itm) => {
  //           name_polda = itm.dataValues.polda.name_polda;
  //           jumlah +=
  //             itm.dataValues.media_sosial +
  //             itm.dataValues.media_elektronik +
  //             itm.dataValues.media_cetak +
  //             itm.dataValues.laka_langgar;
  //         });
  //         dikmaslantasResult.push({
  //           polda_id: item.polda_id,
  //           name_polda: name_polda,
  //           dikmaslantas: jumlah,
  //         });
  //       });

  //       let result_penyebaran = Object.values(
  //         penyebaran.reduce((a, { polda_id, ...props }) => {
  //           if (!a[polda_id])
  //             a[polda_id] = Object.assign({}, { polda_id, data: [props] });
  //           else a[polda_id].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_penyebaran.forEach((item) => {
  //         var name_polda = "";
  //         var jumlah = 0;
  //         item.data.forEach((itm) => {
  //           name_polda = itm.dataValues.polda.name_polda;
  //           jumlah +=
  //             itm.dataValues.stiker +
  //             itm.dataValues.billboard +
  //             itm.dataValues.spanduk +
  //             itm.dataValues.leaflet +
  //             itm.dataValues.jemensosprek;
  //         });
  //         penyebaranResult.push({
  //           polda_id: item.polda_id,
  //           name_polda: name_polda,
  //           penyebaran: jumlah,
  //         });
  //       });

  //       const final = dikmaslantasResult.map((item, index) => {
  //         const data = penyebaranResult.find(
  //           (x) => x.polda_id == item.polda_id
  //         );
  //         if (data) {
  //           item.penyebaran = data.penyebaran;
  //         } else {
  //           item.penyebaran = 0;
  //         }

  //         return item;
  //       });

  //       dataPolda.map((Element, index) => {
  //         let a = final.find((x) => {
  //           return x.polda_id == Element.dataValues.id;
  //         });

  //         if (!a) {
  //           final.push({
  //             polda_id: Element.dataValues.id,
  //             name_polda: Element.dataValues.name_polda,
  //             dikmaslantas: 0,
  //             penyebaran: 0,
  //           });
  //         }
  //       });

  //       finalResponse = final;
  //     }

  //     if (polda) {
  //       let dikmaslantas = await Dikmaslantas_polres_month.findAll({
  //         include: [
  //           { model: Polda, as: "polda" },
  //           { model: Polres, as: "polres" },
  //         ],
  //         where: {
  //           polda_id: decAes(polda_id),
  //         },
  //       });

  //       let penyebaran = await Penyebaran_polres_month.findAll({
  //         include: [{ model: Polda, as: "polda" }],
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

  //       const dikmaslantasResult = [];
  //       const penyebaranResult = [];
  //       let result_dikmaslantas = Object.values(
  //         dikmaslantas.reduce((a, { polres_id, ...props }) => {
  //           if (!a[polres_id])
  //             a[polres_id] = Object.assign({}, { polres_id, data: [props] });
  //           else a[polres_id].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_dikmaslantas.forEach((item) => {
  //         var jumlah = 0;
  //         var name_polres = "";
  //         item.data.forEach((itm) => {
  //           name_polres = itm.dataValues.polres.name_polres;
  //           jumlah +=
  //             itm.dataValues.media_sosial +
  //             itm.dataValues.media_elektronik +
  //             itm.dataValues.media_cetak +
  //             itm.dataValues.laka_langgar;
  //         });
  //         dikmaslantasResult.push({
  //           polres_id: item.polres_id,
  //           name_polres: name_polres,
  //           dikmaslantas: jumlah,
  //         });
  //       });

  //       let result_penyebaran = Object.values(
  //         penyebaran.reduce((a, { polres_id, ...props }) => {
  //           if (!a[polres_id])
  //             a[polres_id] = Object.assign({}, { polres_id, data: [props] });
  //           else a[polres_id].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_penyebaran.forEach((item) => {
  //         var name_polres = "";
  //         var jumlah = 0;
  //         item.data.forEach((itm) => {
  //           name_polres = itm.dataValues.polres.name_polres;
  //           jumlah +=
  //             itm.dataValues.stiker +
  //             itm.dataValues.billboard +
  //             itm.dataValues.spanduk +
  //             itm.dataValues.leaflet +
  //             itm.dataValues.jemensosprek;
  //         });
  //         penyebaranResult.push({
  //           polres_id: item.polres_id,
  //           name_polres: name_polres,
  //           penyebaran: jumlah,
  //         });
  //       });

  //       const final = dikmaslantasResult.map((item, index) => {
  //         const data = penyebaranResult.find(
  //           (x) => x.polda_id == item.polda_id
  //         );
  //         if (data) {
  //           item.penyebaran = data.penyebaran;
  //         } else {
  //           item.penyebaran = 0;
  //         }

  //         return item;
  //       });

  //       dataPolres.map((Element, index) => {
  //         let a = final.find((x) => {
  //           return x.polres_id == Element.dataValues.id;
  //         });

  //         if (!a) {
  //           final.push({
  //             polres_id: Element.dataValues.id,
  //             name_polres: Element.dataValues.name_polres,
  //             dikmaslantas: 0,
  //             penyebaran: 0,
  //           });
  //         }
  //       });

  //       finalResponse = final;
  //     }

  //     if (polres) {
  //       let dikmaslantas = await Dikmaslantas_polres_month.findAll({
  //         include: [{ model: Polres, as: "polres" }],
  //         where: {
  //           polres_id: decAes(polres_id),
  //         },
  //       });

  //       let reduce_dikmaslantas = dikmaslantas.reduce((prevVal, currVal) => {
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

  //       let jumlah_dikmaslantas = Object.values(reduce_dikmaslantas).reduce(
  //         (a, b) => {
  //           return a + b;
  //         },
  //         0
  //       );

  //       let penyebaran = await Penyebaran_polres_month.findAll({
  //         include: [{ model: Polres, as: "polres" }],
  //         where: {
  //           polres_id: decAes(polres_id),
  //         },
  //       });

  //       let reduce_penyebaran = penyebaran.reduce((prevVal, currVal) => {
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

  //       let jumlah_penyebaran = Object.values(reduce_penyebaran).reduce(
  //         (a, b) => {
  //           return a + b;
  //         },
  //         0
  //       );
  //       finalResponse = {
  //         dikmaslantas: jumlah_dikmaslantas,
  //         penyebaran: jumlah_penyebaran,
  //       };
  //     }
  //     response(res, true, "Succeed", finalResponse);
  //   } catch (error) {
  //     response(res, false, "Failed", error.message);
  //   }
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
  //       let dikmaslantas = await Dikmaslantas_polda_month.findAll({
  //         include: [{ model: Polda, as: "polda" }],
  //       });

  //       let penyebaran = await Penyebaran_polda_month.findAll({
  //         include: [{ model: Polda, as: "polda" }],
  //       });

  //       let arrayResponse = [];
  //       const finalResult = [];
  //       const dikmaslantasResult = [];
  //       const penyebaranResult = [];
  //       let result_dikmaslantas = Object.values(
  //         dikmaslantas.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_dikmaslantas.forEach((item) => {
  //         var jumlah = 0;
  //         var date = "";
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           jumlah +=
  //             itm.dataValues.media_sosial +
  //             itm.dataValues.media_elektronik +
  //             itm.dataValues.media_cetak +
  //             itm.dataValues.laka_langgar;
  //         });
  //         dikmaslantasResult.push({
  //           date: moment(date).format("MMMM"),
  //           dikmaslantas: jumlah,
  //         });
  //       });

  //       let result_penyebaran = Object.values(
  //         penyebaran.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_penyebaran.forEach((item) => {
  //         var date = "";
  //         var jumlah = 0;
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           jumlah +=
  //             itm.dataValues.stiker +
  //             itm.dataValues.billboard +
  //             itm.dataValues.spanduk +
  //             itm.dataValues.leaflet +
  //             itm.dataValues.jemensosprek;
  //         });
  //         penyebaranResult.push({
  //           date: moment(date).format("MMMM"),
  //           penyebaran: jumlah,
  //         });
  //       });

  //       const final = dikmaslantasResult.map((item, index) => {
  //         const data = penyebaranResult.find((x) => x.date == item.date);
  //         if (data) {
  //           item.penyebaran = data.penyebaran;
  //         } else {
  //           item.penyebaran = 0;
  //         }

  //         return item;
  //       });

  //       dataMonth.map((Element, index) => {
  //         let a = final.find((x) => {
  //           return x.date == Element;
  //         });

  //         if (!a) {
  //           final.push({
  //             date: Element,
  //             dikmaslantas: 0,
  //             penyebaran: 0,
  //           });
  //         }
  //       });

  //       finalResponse = final;
  //     }

  //     if (polda) {
  //       let dikmaslantas = await Dikmaslantas_polres_month.findAll({
  //         include: [
  //           { model: Polda, as: "polda" },
  //           { model: Polres, as: "polres" },
  //         ],
  //         where: {
  //           polda_id: polda_id,
  //         },
  //       });

  //       let penyebaran = await Penyebaran_polres_month.findAll({
  //         include: [{ model: Polda, as: "polda" }],
  //         where: {
  //           polda_id: polda_id,
  //         },
  //       });

  //       const dikmaslantasResult = [];
  //       const penyebaranResult = [];
  //       let result_dikmaslantas = Object.values(
  //         dikmaslantas.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_dikmaslantas.forEach((item) => {
  //         var jumlah = 0;
  //         var date = "";
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           jumlah +=
  //             itm.dataValues.media_sosial +
  //             itm.dataValues.media_elektronik +
  //             itm.dataValues.media_cetak +
  //             itm.dataValues.laka_langgar;
  //         });
  //         dikmaslantasResult.push({
  //           date: moment(date).format("MMMM"),
  //           dikmaslantas: jumlah,
  //         });
  //       });

  //       let result_penyebaran = Object.values(
  //         penyebaran.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_penyebaran.forEach((item) => {
  //         var date = "";
  //         var jumlah = 0;
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           jumlah +=
  //             itm.dataValues.stiker +
  //             itm.dataValues.billboard +
  //             itm.dataValues.spanduk +
  //             itm.dataValues.leaflet +
  //             itm.dataValues.jemensosprek;
  //         });
  //         penyebaranResult.push({
  //           date: moment(date).format("YYYY"),
  //           penyebaran: jumlah,
  //         });
  //       });

  //       const final = dikmaslantasResult.map((item, index) => {
  //         const data = penyebaranResult.find((x) => x.date == item.date);
  //         if (data) {
  //           item.penyebaran = data.penyebaran;
  //         } else {
  //           item.penyebaran = 0;
  //         }

  //         return item;
  //       });

  //       dataMonth.map((Element, index) => {
  //         let a = final.find((x) => {
  //           return x.date == Element;
  //         });

  //         if (!a) {
  //           final.push({
  //             date: Element,
  //             dikmaslantas: 0,
  //             penyebaran: 0,
  //           });
  //         }
  //       });

  //       finalResponse = final;
  //     }

  //     if (polres) {
  //       let dikmaslantas = await Dikmaslantas_polres_month.findAll({
  //         where: {
  //           polres_id: polres_id,
  //         },
  //       });

  //       let penyebaran = await Penyebaran_polres_month.findAll({
  //         where: {
  //           polres_id: polres_id,
  //         },
  //       });
  //       const dikmaslantasResult = [];
  //       const penyebaranResult = [];
  //       let result_dikmaslantas = Object.values(
  //         dikmaslantas.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_dikmaslantas.forEach((item) => {
  //         var date = "";
  //         var jumlah = 0;
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           jumlah +=
  //             itm.dataValues.media_sosial +
  //             itm.dataValues.media_elektronik +
  //             itm.dataValues.media_cetak +
  //             itm.dataValues.laka_langgar;
  //         });
  //         dikmaslantasResult.push({
  //           date: moment(date).format("MMMM"),
  //           dikmaslantas: jumlah,
  //         });
  //       });

  //       let result_penyebaran = Object.values(
  //         penyebaran.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );
  //       result_penyebaran.forEach((item) => {
  //         var date = "";
  //         var jumlah = 0;
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           jumlah +=
  //             itm.dataValues.stiker +
  //             itm.dataValues.leaflet +
  //             itm.dataValues.spanduk +
  //             itm.dataValues.billboard +
  //             itm.dataValues.jemensosprek
  //         });
  //         penyebaranResult.push({
  //           date: moment(date).format("MMMM"),
  //           penyebaran: jumlah,
  //         });
  //       });

  //       const final = dikmaslantasResult.map((item, index) => {
  //         const data = penyebaranResult.find((x) => x.date == item.date);
  //         if (data) {
  //           item.penyebaran = data.penyebaran;
  //         } else {
  //           item.penyebaran = 0;
  //         }

  //         return item;
  //       });

  //       dataMonth.map((Element, index) => {
  //         let a = final.find((x) => {
  //           return x.date == Element;
  //         });

  //         if (!a) {
  //           final.push({
  //             date: Element,
  //             dikmaslantas: 0,
  //             penyebaran: 0,
  //           });
  //         }
  //       });

  //       finalResponse = final;
  //     }
  //     response(res, true, "Succeed", finalResponse);
  //   } catch (error) {
  //     response(res, false, "Failed", error.message);
  //   }
  // };
};
