const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const { Op, Sequelize, where } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");

const Master_sim = require("../model/input_sim");
const Sim_polda_day = require("../model/count_sim_polda_day");
const Sim_polda_month = require("../model/count_sim_polda_month");
const Sim_polres_month = require("../model/count_sim_polres_month");

const Master_bpkb = require("../model/input_bpkb");
const Bpkb_polda_day = require("../model/count_bpkb_polda_day");
const Bpkb_polda_month = require("../model/count_bpkb_polda_month");
const Bpkb_polres_month = require("../model/count_bpkb_polres_month");

const Master_stnk = require("../model/input_stnk");
const Stnk_polda_day = require("../model/count_stnk_polda_day");
const Stnk_polda_month = require("../model/count_stnk_polda_month");
const Stnk_polres_month = require("../model/count_stnk_polres_month");

const Master_ranmor = require("../model/input_ranmor");
const Ranmor_polda_day = require("../model/count_ranmor_polda_day");
const Ranmor_polda_month = require("../model/count_ranmor_polda_month");
const Ranmor_polres_month = require("../model/count_ranmor_polres_month");

const Polda = require("../model/polda");
const Polres = require("../model/polres");

const decAes = (token) =>
  AESDecrypt(token, {
    isSafeUrl: true,
    parseMode: "string",
  });

module.exports = class DitregidentController {
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
        group: ["polda.id", "bpkb.id", "sim.id", "stnk.id", "ranmor.id"],
        attributes: ["id", "name_polda"],
        include: [
          {
            model: Bpkb_polda_day,
            required: false,
            as: "bpkb",
            attributes: [
              [
                Sequelize.literal(
                  "SUM(bpkb.bbn_1 + bpkb.bbn_2 + bpkb.mutasi_masuk + bpkb.mutasi_keluar + bpkb.perubahan_pergantian)"
                ),
                "total_bpkb",
              ],
            ],
          },
          {
            model: Stnk_polda_day,
            required: false,
            as: "stnk",
            attributes: [
              [
                Sequelize.literal(
                  "SUM(stnk.bbn_1_r2 + stnk.bbn_1_r4 + stnk.perubahan_r2 + stnk.perubahan_r4 + stnk.perpanjangan_r2 + stnk.perpanjangan_r4 + stnk.mutasi_keluar_r2 + stnk.mutasi_keluar_r4 + stnk.mutasi_masuk_r2 + stnk.mutasi_masuk_r4 + stnk.pengesahan_r2 + stnk.pengesahan_r4 + stnk.samolnas_r2 + stnk.samolnas_r4)"
                ),
                "total_stnk",
              ],
            ],
          },
          {
            model: Sim_polda_day,
            required: false,
            as: "sim",
            attributes: [
              [
                Sequelize.literal(
                  "SUM(sim.baru_a + sim.baru_c + sim.baru_c1 + sim.baru_c2 + sim.baru_d + sim.baru_d1 + sim.perpanjangan_a + sim.perpanjangan_au + sim.perpanjangan_c + sim.perpanjangan_c1 + sim.perpanjangan_c2 + sim.perpanjangan_d + sim.perpanjangan_d1 + sim.perpanjangan_b1 + sim.perpanjangan_b1u + sim.perpanjangan_b2 + sim.perpanjangan_b2u + sim.peningkatan_au + sim.peningkatan_b1 + sim.peningkatan_b1u + sim.peningkatan_b2 + sim.peningkatan_b2u)"
                ),
                "total_sim",
              ],
            ],
          },
          {
            model: Ranmor_polda_day,
            required: false,
            as: "ranmor",
            attributes: [
              [
                Sequelize.literal(
                  "SUM(ranmor.mobil_penumpang + ranmor.mobil_barang + ranmor.mobil_bus + ranmor.ransus + ranmor.sepeda_motor)"
                ),
                "total_ranmor",
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
        var res_bpkb = 0;
        var res_stnk = 0;
        var res_sim = 0;
        var res_ranmor = 0;
        for (let j = 0; j < data.bpkb.length; j++) {
          res_bpkb += parseInt(data.bpkb[j].dataValues.total_bpkb);
        }

        for (let j = 0; j < data.stnk.length; j++) {
          res_stnk += parseInt(data.stnk[j].dataValues.total_stnk);
        }

        for (let j = 0; j < data.sim.length; j++) {
          res_sim += parseInt(data.sim[j].dataValues.total_sim);
        }

        for (let j = 0; j < data.ranmor.length; j++) {
          res_ranmor += parseInt(data.ranmor[j].dataValues.total_ranmor);
        }

        rows.push({
          id: finals[i].dataValues.id,
          name_polda: finals[i].dataValues.name_polda,
          bpkb: res_bpkb || 0,
          stnk: res_stnk || 0,
          sim: res_sim || 0,
          ranmor: res_ranmor || 0,
          total: res_bpkb + res_stnk + res_sim + res_ranmor,
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

      let bpkb = await Bpkb_polda_day.findAll({
        group: groups,
        attributes: [
          custom_attributes,
          [
            Sequelize.literal(
              "SUM(bbn_1 + bbn_2 + mutasi_masuk + mutasi_keluar + perubahan_pergantian)"
            ),
            "total_bpkb",
          ],
        ],
        raw: true,
        where: wheres,
      });

      let stnk = await Stnk_polda_day.findAll({
        group: groups,
        attributes: [
          custom_attributes,
          [
            Sequelize.literal(
              "SUM(bbn_1_r2 + bbn_1_r4 + perubahan_r2 + perubahan_r4 + perpanjangan_r2 + perpanjangan_r4 + mutasi_keluar_r2 + mutasi_keluar_r4 + mutasi_masuk_r2 + mutasi_masuk_r4 + pengesahan_r2 + pengesahan_r4 + samolnas_r2 + samolnas_r4)"
            ),
            "total_stnk",
          ],
        ],
        raw: true,
        where: wheres,
      });

      let sim = await Sim_polda_day.findAll({
        group: groups,
        attributes: [
          custom_attributes,
          [
            Sequelize.literal(
              "SUM(baru_a + baru_c + baru_c1 + baru_c2 + baru_d + baru_d1 + perpanjangan_a + perpanjangan_au + perpanjangan_c + perpanjangan_c1 + perpanjangan_c2 + perpanjangan_d + perpanjangan_d1 + perpanjangan_b1 + perpanjangan_b1u + perpanjangan_b2 + perpanjangan_b2u + peningkatan_au + peningkatan_b1 + peningkatan_b1u + peningkatan_b2 + peningkatan_b2u)"
            ),
            "total_sim",
          ],
        ],
        raw: true,
        where: wheres,
      });

      let ranmor = await Ranmor_polda_day.findAll({
        group: groups,
        attributes: [
          custom_attributes,
          [
            Sequelize.literal(
              "SUM(mobil_penumpang + mobil_barang + mobil_bus + ransus + sepeda_motor)"
            ),
            "total_ranmor",
          ],
        ],
        raw: true,
        where: wheres,
      });

      let finals = [];
      let arr_bpkb = [];
      let arr_stnk = [];
      let arr_sim = [];
      let arr_ranmor = [];
      if (type === "day") {
        const asd = list_day.map((item, index) => {
          let bpkb_data = bpkb.find((x) => x.date == item);
          let stnk_data = stnk.find((x) => x.date == item);
          let sim_data = sim.find((x) => x.date == item);
          let ranmor_data = ranmor.find((x) => x.date == item);

          let obj = {};
          obj.date = item;
          if (bpkb_data) {
            obj.bpkb = parseInt(bpkb_data.total_bpkb);
          } else {
            obj.bpkb = 0;
          }

          if (stnk_data) {
            obj.stnk = parseInt(stnk_data.total_stnk);
          } else {
            obj.stnk = 0;
          }

          if (sim_data) {
            obj.sim = parseInt(sim_data.total_sim);
          } else {
            obj.sim = 0;
          }

          if (ranmor_data) {
            obj.ranmor = parseInt(ranmor_data.total_ranmor);
          } else {
            obj.ranmor = 0;
          }
          finals.push(obj);
        });
      } else if (type === "month") {
        const asd = list_month.map((item, index) => {
          let bpkb_data = bpkb.find(
            (x) => moment(x.month).format("MMMM") == item
          );
          let stnk_data = stnk.find(
            (x) => moment(x.month).format("MMMM") == item
          );
          let sim_data = sim.find(
            (x) => moment(x.month).format("MMMM") == item
          );
          let ranmor_data = ranmor.find(
            (x) => moment(x.month).format("MMMM") == item
          );

          let obj = {};
          obj.date = item;
          if (bpkb_data) {
            obj.bpkb = parseInt(bpkb_data.total_bpkb);
          } else {
            obj.bpkb = 0;
          }

          if (stnk_data) {
            obj.stnk = parseInt(stnk_data.total_stnk);
          } else {
            obj.stnk = 0;
          }

          if (sim_data) {
            obj.sim = parseInt(sim_data.total_sim);
          } else {
            obj.sim = 0;
          }

          if (ranmor_data) {
            obj.ranmor = parseInt(ranmor_data.total_ranmor);
          } else {
            obj.ranmor = 0;
          }
          finals.push(obj);
        });
      } else if (type === "year") {
        const asd = list_year.map((item, index) => {
          let bpkb_data = bpkb.find(
            (x) => moment(x.month).format("YYYY") == item
          );
          let stnk_data = stnk.find(
            (x) => moment(x.month).format("YYYY") == item
          );
          let sim_data = sim.find(
            (x) => moment(x.month).format("YYYY") == item
          );
          let ranmor_data = ranmor.find(
            (x) => moment(x.month).format("YYYY") == item
          );

          let obj = {};
          obj.date = item;
          if (bpkb_data) {
            obj.bpkb = parseInt(bpkb_data.total_bpkb);
          } else {
            obj.bpkb = 0;
          }

          if (stnk_data) {
            obj.stnk = parseInt(stnk_data.total_stnk);
          } else {
            obj.stnk = 0;
          }

          if (sim_data) {
            obj.sim = parseInt(sim_data.total_sim);
          } else {
            obj.sim = 0;
          }

          if (ranmor_data) {
            obj.ranmor = parseInt(ranmor_data.total_ranmor);
          } else {
            obj.ranmor = 0;
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
  //       let sim = await Sim_polda_month.findAll({
  //         include: [{ model: Polda, as: "polda" }],
  //       });

  //       let stnk = await Stnk_polda_month.findAll({
  //         include: [{ model: Polda, as: "polda" }],
  //       });

  //       let bpkb = await Bpkb_polda_month.findAll({
  //         include: [{ model: Polda, as: "polda" }],
  //       });

  //       let ranmor = await Ranmor_polda_month.findAll({
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
  //       const ranmorResult = [];

  //       let result_sim = Object.values(
  //         sim.reduce((a, { polda_id, ...props }) => {
  //           if (!a[polda_id])
  //             a[polda_id] = Object.assign({}, { polda_id, data: [props] });
  //           else a[polda_id].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_sim.forEach((item) => {
  //         var jumlah = 0;
  //         var name_polda = "";
  //         item.data.forEach((itm) => {
  //           name_polda = itm.dataValues.polda.name_polda;
  //           jumlah += itm.dataValues.baru + itm.dataValues.perpanjangan;
  //         });
  //         finalResult.push({
  //           polda_id: item.polda_id,
  //           name_polda: name_polda,
  //           sim: jumlah,
  //         });
  //       });

  //       let result_stnk = Object.values(
  //         stnk.reduce((a, { polda_id, ...props }) => {
  //           if (!a[polda_id])
  //             a[polda_id] = Object.assign({}, { polda_id, data: [props] });
  //           else a[polda_id].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_stnk.forEach((item) => {
  //         var name_polda = "";
  //         var jumlah = 0;
  //         item.data.forEach((itm) => {
  //           name_polda = itm.dataValues.polda.name_polda;
  //           jumlah +=
  //             itm.dataValues.baru +
  //             itm.dataValues.perpanjangan +
  //             itm.dataValues.rubentina;
  //         });
  //         finalResult.push({
  //           polda_id: item.polda_id,
  //           name_polda: name_polda,
  //           stnk: jumlah,
  //         });
  //       });

  //       let result_bpkb = Object.values(
  //         bpkb.reduce((a, { polda_id, ...props }) => {
  //           if (!a[polda_id])
  //             a[polda_id] = Object.assign({}, { polda_id, data: [props] });
  //           else a[polda_id].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_bpkb.forEach((item) => {
  //         var jumlah = 0;
  //         var name_polda = "";
  //         item.data.forEach((itm) => {
  //           name_polda = itm.dataValues.polda.name_polda;
  //           jumlah +=
  //             itm.dataValues.baru +
  //             itm.dataValues.perpanjangan +
  //             itm.dataValues.rubentina;
  //         });
  //         finalResult.push({
  //           polda_id: item.polda_id,
  //           name_polda: name_polda,
  //           bpkb: jumlah,
  //         });
  //       });

  //       let result_ranmor = Object.values(
  //         ranmor.reduce((a, { polda_id, ...props }) => {
  //           if (!a[polda_id])
  //             a[polda_id] = Object.assign({}, { polda_id, data: [props] });
  //           else a[polda_id].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_ranmor.forEach((item) => {
  //         var jumlah = 0;
  //         var name_polda = "";
  //         item.data.forEach((itm) => {
  //           name_polda = itm.dataValues.polda.name_polda;
  //           jumlah +=
  //             itm.dataValues.mobil_barang +
  //             itm.dataValues.mobil_bus +
  //             itm.dataValues.ransus +
  //             itm.dataValues.sepeda_motor +
  //             itm.dataValues.mobil_penumpang;
  //         });
  //         finalResult.push({
  //           polda_id: item.polda_id,
  //           name_polda: name_polda,
  //           ranmor: jumlah,
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
  //         var stnk = 0;
  //         var sim = 0;
  //         var bpkb = 0;
  //         var name_polda = 0;
  //         var ranmor = 0;
  //         res.data.forEach((element) => {
  //           console.log(element);
  //           stnk += element.stnk || 0;
  //           sim += element.sim || 0;
  //           bpkb += element.bpkb || 0;
  //           ranmor += element.ranmor || 0;
  //           name_polda = element.name_polda;
  //         });
  //         k.push({
  //           polda_id: res.polda_id,
  //           name_polda: name_polda,
  //           stnk: stnk,
  //           sim: sim,
  //           ranmor: ranmor,
  //           bpkb: bpkb,
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
  //             stnk: 0,
  //             sim: 0,
  //             bpkb: 0,
  //             ranmor: 0,
  //           });
  //         }
  //       });

  //       finalResponse = k;
  //     }

  //     if (polda) {
  //       let sim = await Sim_polres_month.findAll({
  //         include: [
  //           { model: Polda, as: "polda" },
  //           { model: Polres, as: "polres" },
  //         ],
  //         where: {
  //           polda_id: decAes(polda_id),
  //         },
  //       });

  //       let stnk = await Stnk_polres_month.findAll({
  //         include: [
  //           { model: Polda, as: "polda" },
  //           { model: Polres, as: "polres" },
  //         ],
  //         where: {
  //           polda_id: decAes(polda_id),
  //         },
  //       });

  //       let bpkb = await Bpkb_polres_month.findAll({
  //         include: [
  //           { model: Polda, as: "polda" },
  //           { model: Polres, as: "polres" },
  //         ],
  //         where: {
  //           polda_id: decAes(polda_id),
  //         },
  //       });

  //       let ranmor = await Ranmor_polres_month.findAll({
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
  //       const simResult = [];
  //       const stnkResult = [];
  //       const bpkbResult = [];
  //       const ranmorResult = [];

  //       let result_sim = Object.values(
  //         sim.reduce((a, { polres_id, ...props }) => {
  //           if (!a[polres_id])
  //             a[polres_id] = Object.assign({}, { polres_id, data: [props] });
  //           else a[polres_id].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_sim.forEach((item) => {
  //         var jumlah = 0;
  //         var name_polres = "";
  //         item.data.forEach((itm) => {
  //           name_polres = itm.dataValues.polres.name_polres;
  //           jumlah += itm.dataValues.baru + itm.dataValues.perpanjangan;
  //         });
  //         finalResult.push({
  //           polres_id: item.polres_id,
  //           name_polres: name_polres,
  //           sim: jumlah,
  //         });
  //       });

  //       let result_stnk = Object.values(
  //         stnk.reduce((a, { polres_id, ...props }) => {
  //           if (!a[polres_id])
  //             a[polres_id] = Object.assign({}, { polres_id, data: [props] });
  //           else a[polres_id].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_stnk.forEach((item) => {
  //         var name_polres = "";
  //         var jumlah = 0;
  //         item.data.forEach((itm) => {
  //           name_polres = itm.dataValues.polres.name_polres;
  //           jumlah +=
  //             itm.dataValues.baru +
  //             itm.dataValues.perpanjangan +
  //             itm.dataValues.rubentina;
  //         });
  //         finalResult.push({
  //           polres_id: item.polres_id,
  //           name_polres: name_polres,
  //           stnk: jumlah,
  //         });
  //       });

  //       let result_bpkb = Object.values(
  //         bpkb.reduce((a, { polres_id, ...props }) => {
  //           if (!a[polres_id])
  //             a[polres_id] = Object.assign({}, { polres_id, data: [props] });
  //           else a[polres_id].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_bpkb.forEach((item) => {
  //         var jumlah = 0;
  //         var name_polres = "";
  //         item.data.forEach((itm) => {
  //           name_polres = itm.dataValues.polres.name_polres;
  //           jumlah +=
  //             itm.dataValues.baru +
  //             itm.dataValues.perpanjangan +
  //             itm.dataValues.rubentina;
  //         });
  //         finalResult.push({
  //           polres_id: item.polres_id,
  //           name_polres: name_polres,
  //           bpkb: jumlah,
  //         });
  //       });

  //       let result_ranmor = Object.values(
  //         ranmor.reduce((a, { polres_id, ...props }) => {
  //           if (!a[polres_id])
  //             a[polres_id] = Object.assign({}, { polres_id, data: [props] });
  //           else a[polres_id].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_ranmor.forEach((item) => {
  //         var jumlah = 0;
  //         var name_polres = "";
  //         item.data.forEach((itm) => {
  //           name_polres = itm.dataValues.polres.name_polres;
  //           jumlah +=
  //             itm.dataValues.mobil_barang +
  //             itm.dataValues.mobil_bus +
  //             itm.dataValues.ransus +
  //             itm.dataValues.sepeda_motor +
  //             itm.dataValues.mobil_penumpang;
  //         });
  //         finalResult.push({
  //           polres_id: item.polres_id,
  //           name_polres: name_polres,
  //           ranmor: jumlah,
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
  //         var stnk = 0;
  //         var sim = 0;
  //         var bpkb = 0;
  //         var name_polres = "";
  //         var ranmor = 0;
  //         res.data.forEach((element) => {
  //           stnk += element.stnk || 0;
  //           sim += element.sim || 0;
  //           bpkb += element.bpkb || 0;
  //           ranmor += element.ranmor || 0;
  //           name_polres = element.name_polres;
  //         });
  //         k.push({
  //           polres_id: res.polres_id,
  //           name_polres: name_polres,
  //           stnk: stnk,
  //           sim: sim,
  //           ranmor: ranmor,
  //           bpkb: bpkb,
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
  //             stnk: 0,
  //             sim: 0,
  //             bpkb: 0,
  //             ranmor: 0,
  //           });
  //         }
  //       });

  //       finalResponse = k;
  //     }

  //     if (polres) {
  //       let sim = await Sim_polres_month.findAll({
  //         include: [{ model: Polres, as: "polres" }],
  //         where: {
  //           polres_id: decAes(polres_id),
  //         },
  //       });

  //       let stnk = await Stnk_polres_month.findAll({
  //         include: [{ model: Polres, as: "polres" }],
  //         where: {
  //           polres_id: decAes(polres_id),
  //         },
  //       });

  //       let bpkb = await Bpkb_polres_month.findAll({
  //         include: [{ model: Polres, as: "polres" }],
  //         where: {
  //           polres_id: decAes(polres_id),
  //         },
  //       });

  //       let ranmor = await Ranmor_polres_month.findAll({
  //         include: [{ model: Polres, as: "polres" }],
  //         where: {
  //           polres_id: decAes(polres_id),
  //         },
  //       });

  //       let reduce_sim = sim.reduce((prevVal, currVal) => {
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

  //       let jumlah_sim = Object.values(reduce_sim).reduce((a, b) => {
  //         return a + b;
  //       }, 0);

  //       let reduce_stnk = stnk.reduce((prevVal, currVal) => {
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

  //       let jumlah_stnk = Object.values(reduce_stnk).reduce((a, b) => {
  //         return a + b;
  //       }, 0);

  //       let reduce_bpkb = bpkb.reduce((prevVal, currVal) => {
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

  //       let jumlah_bpkb = Object.values(reduce_bpkb).reduce((a, b) => {
  //         return a + b;
  //       }, 0);

  //       let reduce_ranmor = ranmor.reduce((prevVal, currVal) => {
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

  //       let jumlah_ranmor = Object.values(reduce_ranmor).reduce((a, b) => {
  //         return a + b;
  //       }, 0);

  //       finalResponse = {
  //         ranmor: jumlah_ranmor,
  //         bpkb: jumlah_bpkb,
  //         sim: jumlah_sim,
  //         stnk: jumlah_stnk,
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
  //       let sim = await Sim_polda_month.findAll({
  //         include: [{ model: Polda, as: "polda" }],
  //       });

  //       let stnk = await Stnk_polda_month.findAll({
  //         include: [{ model: Polda, as: "polda" }],
  //       });

  //       let bpkb = await Bpkb_polda_month.findAll({
  //         include: [{ model: Polda, as: "polda" }],
  //       });

  //       let ranmor = await Ranmor_polda_month.findAll({
  //         include: [{ model: Polda, as: "polda" }],
  //       });

  //       let arrayResponse = [];
  //       const finalResult = [];
  //       const simResult = [];
  //       const stnkResult = [];
  //       const bpkbResult = [];
  //       const ranmorResult = [];

  //       let result_sim = Object.values(
  //         sim.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_sim.forEach((item) => {
  //         var jumlah = 0;
  //         var date = "";
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           jumlah += itm.dataValues.baru + itm.dataValues.perpanjangan;
  //         });
  //         finalResult.push({
  //           date: moment(date).format("MMMM"),
  //           sim: jumlah,
  //         });
  //       });

  //       let result_stnk = Object.values(
  //         stnk.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_stnk.forEach((item) => {
  //         var date = "";
  //         var jumlah = 0;
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           jumlah +=
  //             itm.dataValues.baru +
  //             itm.dataValues.perpanjangan +
  //             itm.dataValues.rubentina;
  //         });
  //         finalResult.push({
  //           date: moment(date).format("MMMM"),
  //           stnk: jumlah,
  //         });
  //       });

  //       let result_bpkb = Object.values(
  //         bpkb.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_bpkb.forEach((item) => {
  //         var jumlah = 0;
  //         var date = "";
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           jumlah +=
  //             itm.dataValues.baru +
  //             itm.dataValues.perpanjangan +
  //             itm.dataValues.rubentina;
  //         });
  //         finalResult.push({
  //           date: moment(date).format("MMMM"),
  //           bpkb: jumlah,
  //         });
  //       });

  //       let result_ranmor = Object.values(
  //         ranmor.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_ranmor.forEach((item) => {
  //         var jumlah = 0;
  //         var date = "";
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           jumlah +=
  //             itm.dataValues.mobil_barang +
  //             itm.dataValues.mobil_bus +
  //             itm.dataValues.ransus +
  //             itm.dataValues.sepeda_motor +
  //             itm.dataValues.mobil_penumpang;
  //         });
  //         finalResult.push({
  //           date: moment(date).format("MMMM"),
  //           ranmor: jumlah,
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
  //         var stnk = 0;
  //         var sim = 0;
  //         var bpkb = 0;
  //         var date = "";
  //         var ranmor = 0;
  //         res.data.forEach((element) => {
  //           stnk += element.stnk || 0;
  //           sim += element.sim || 0;
  //           bpkb += element.bpkb || 0;
  //           ranmor += element.ranmor || 0;
  //           date = res.date;
  //         });
  //         k.push({
  //           date: date,
  //           stnk: stnk,
  //           sim: sim,
  //           ranmor: ranmor,
  //           bpkb: bpkb,
  //         });
  //       });

  //       dataMonth.map((Element, index) => {
  //         let a = k.find((x) => {
  //           return x.date == Element;
  //         });

  //         if (!a) {
  //           k.push({
  //             date: Element,
  //             stnk: 0,
  //             sim: 0,
  //             bpkb: 0,
  //             ranmor: 0,
  //           });
  //         }
  //       });

  //       finalResponse = k;
  //     }

  //     if (polda) {
  //       let sim = await Sim_polres_month.findAll({
  //         include: [
  //           { model: Polda, as: "polda" },
  //           { model: Polres, as: "polres" },
  //         ],
  //         where: {
  //           polda_id: polda_id,
  //         },
  //       });

  //       let stnk = await Stnk_polres_month.findAll({
  //         include: [
  //           { model: Polda, as: "polda" },
  //           { model: Polres, as: "polres" },
  //         ],
  //         where: {
  //           polda_id: polda_id,
  //         },
  //       });

  //       let bpkb = await Bpkb_polres_month.findAll({
  //         include: [
  //           { model: Polda, as: "polda" },
  //           { model: Polres, as: "polres" },
  //         ],
  //         where: {
  //           polda_id: polda_id,
  //         },
  //       });

  //       let ranmor = await Ranmor_polres_month.findAll({
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
  //       const simResult = [];
  //       const stnkResult = [];
  //       const bpkbResult = [];
  //       const ranmorResult = [];

  //       let result_sim = Object.values(
  //         sim.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_sim.forEach((item) => {
  //         var jumlah = 0;
  //         var date = "";
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           jumlah += itm.dataValues.baru + itm.dataValues.perpanjangan;
  //         });
  //         finalResult.push({
  //           date: moment(date).format("MMMM"),
  //           sim: jumlah,
  //         });
  //       });

  //       let result_stnk = Object.values(
  //         stnk.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_stnk.forEach((item) => {
  //         var date = "";
  //         var jumlah = 0;
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           jumlah +=
  //             itm.dataValues.baru +
  //             itm.dataValues.perpanjangan +
  //             itm.dataValues.rubentina;
  //         });
  //         finalResult.push({
  //           date: moment(date).format("MMMM"),
  //           stnk: jumlah,
  //         });
  //       });

  //       let result_bpkb = Object.values(
  //         bpkb.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_bpkb.forEach((item) => {
  //         var jumlah = 0;
  //         var date = "";
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           jumlah +=
  //             itm.dataValues.baru +
  //             itm.dataValues.perpanjangan +
  //             itm.dataValues.rubentina;
  //         });
  //         finalResult.push({
  //           date: moment(date).format("MMMM"),
  //           bpkb: jumlah,
  //         });
  //       });

  //       let result_ranmor = Object.values(
  //         ranmor.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_ranmor.forEach((item) => {
  //         var jumlah = 0;
  //         var date = "";
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           jumlah +=
  //             itm.dataValues.mobil_barang +
  //             itm.dataValues.mobil_bus +
  //             itm.dataValues.ransus +
  //             itm.dataValues.sepeda_motor +
  //             itm.dataValues.mobil_penumpang;
  //         });
  //         finalResult.push({
  //           date: moment(date).format("MMMM"),
  //           ranmor: jumlah,
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
  //         var stnk = 0;
  //         var sim = 0;
  //         var bpkb = 0;
  //         var date = "";
  //         var ranmor = 0;
  //         res.data.forEach((element) => {
  //           stnk += element.stnk || 0;
  //           sim += element.sim || 0;
  //           bpkb += element.bpkb || 0;
  //           ranmor += element.ranmor || 0;
  //           date = res.date;
  //         });
  //         k.push({
  //           date: date,
  //           stnk: stnk,
  //           sim: sim,
  //           ranmor: ranmor,
  //           bpkb: bpkb,
  //         });
  //       });

  //       dataMonth.map((Element, index) => {
  //         let a = k.find((x) => {
  //           return x.date == Element;
  //         });

  //         if (!a) {
  //           k.push({
  //             date: Element,
  //             stnk: 0,
  //             sim: 0,
  //             bpkb: 0,
  //             ranmor: 0,
  //           });
  //         }
  //       });

  //       finalResponse = k;
  //     }

  //     if (polres) {
  //       let sim = await Sim_polres_month.findAll({
  //         include: [{ model: Polres, as: "polres" }],
  //         where: {
  //           polres_id: polres_id,
  //         },
  //       });

  //       let stnk = await Stnk_polres_month.findAll({
  //         include: [{ model: Polres, as: "polres" }],
  //         where: {
  //           polres_id: polres_id,
  //         },
  //       });

  //       let bpkb = await Bpkb_polres_month.findAll({
  //         include: [{ model: Polres, as: "polres" }],
  //         where: {
  //           polres_id: polres_id,
  //         },
  //       });

  //       let ranmor = await Ranmor_polres_month.findAll({
  //         include: [{ model: Polres, as: "polres" }],
  //         where: {
  //           polres_id: polres_id,
  //         },
  //       });

  //       let arrayResponse = [];
  //       const finalResult = [];
  //       const simResult = [];
  //       const stnkResult = [];
  //       const bpkbResult = [];
  //       const ranmorResult = [];

  //       let result_sim = Object.values(
  //         sim.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_sim.forEach((item) => {
  //         var jumlah = 0;
  //         var date = "";
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           jumlah += itm.dataValues.baru + itm.dataValues.perpanjangan;
  //         });
  //         finalResult.push({
  //           date: moment(date).format("MMMM"),
  //           sim: jumlah,
  //         });
  //       });

  //       let result_stnk = Object.values(
  //         stnk.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_stnk.forEach((item) => {
  //         var date = "";
  //         var jumlah = 0;
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           jumlah +=
  //             itm.dataValues.baru +
  //             itm.dataValues.perpanjangan +
  //             itm.dataValues.rubentina;
  //         });
  //         finalResult.push({
  //           date: moment(date).format("MMMM"),
  //           stnk: jumlah,
  //         });
  //       });

  //       let result_bpkb = Object.values(
  //         bpkb.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_bpkb.forEach((item) => {
  //         var jumlah = 0;
  //         var date = "";
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           jumlah +=
  //             itm.dataValues.baru +
  //             itm.dataValues.perpanjangan +
  //             itm.dataValues.rubentina;
  //         });
  //         finalResult.push({
  //           date: moment(date).format("MMMM"),
  //           bpkb: jumlah,
  //         });
  //       });

  //       let result_ranmor = Object.values(
  //         ranmor.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );

  //       result_ranmor.forEach((item) => {
  //         var jumlah = 0;
  //         var date = "";
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           jumlah +=
  //             itm.dataValues.mobil_barang +
  //             itm.dataValues.mobil_bus +
  //             itm.dataValues.ransus +
  //             itm.dataValues.sepeda_motor +
  //             itm.dataValues.mobil_penumpang;
  //         });
  //         finalResult.push({
  //           date: moment(date).format("MMMM"),
  //           ranmor: jumlah,
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
  //         var stnk = 0;
  //         var sim = 0;
  //         var bpkb = 0;
  //         var date = "";
  //         var ranmor = 0;
  //         res.data.forEach((element) => {
  //           stnk += element.stnk || 0;
  //           sim += element.sim || 0;
  //           bpkb += element.bpkb || 0;
  //           ranmor += element.ranmor || 0;
  //           date = res.date;
  //         });
  //         k.push({
  //           date: date,
  //           stnk: stnk,
  //           sim: sim,
  //           ranmor: ranmor,
  //           bpkb: bpkb,
  //         });
  //       });

  //       dataMonth.map((Element, index) => {
  //         let a = k.find((x) => {
  //           return x.date == Element;
  //         });

  //         if (!a) {
  //           k.push({
  //             date: Element,
  //             stnk: 0,
  //             sim: 0,
  //             bpkb: 0,
  //             ranmor: 0,
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
