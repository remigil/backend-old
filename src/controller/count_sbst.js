const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const { Op, Sequelize, where } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");

const Sim_polda_day = require("../model/count_sim_polda_day");
const Sim_polda_month = require("../model/count_sim_polda_month");

const Bpkb_polda_day = require("../model/count_bpkb_polda_day");
const Bpkb_polda_month = require("../model/count_bpkb_polda_month");

const Stnk_polda_day = require("../model/count_stnk_polda_day");
const Stnk_polda_month = require("../model/count_stnk_polda_month");

const Tnkb_polda_day = require("../model/count_tnkb_polda_day");
const Tckb_polda_day = require("../model/count_tckb_polda_day");
const Stck_polda_day = require("../model/count_stck_polda_day");
const Skukp_polda_day = require("../model/count_skukp_polda_day");

const Polda = require("../model/polda");
const Polres = require("../model/polres");

const decAes = (token) =>
  AESDecrypt(token, {
    isSafeUrl: true,
    parseMode: "string",
  });

module.exports = class SBSTController {
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
          "bpkb.id",
          "sim.id",
          "stnk.id",
          "tnkb.id",
          "tckb.id",
          "stck.id",
          "skukp.id",
        ],
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
            model: Tnkb_polda_day,
            required: false,
            as: "tnkb",
            attributes: [[Sequelize.literal("SUM(tnkb.tnkb)"), "total_tnkb"]],
          },
          {
            model: Tckb_polda_day,
            required: false,
            as: "tckb",
            attributes: [[Sequelize.literal("SUM(tckb.tckb)"), "total_tckb"]],
          },
          {
            model: Stck_polda_day,
            required: false,
            as: "stck",
            attributes: [[Sequelize.literal("SUM(stck.stck)"), "total_stck"]],
          },
          {
            model: Skukp_polda_day,
            required: false,
            as: "skukp",
            attributes: [
              [Sequelize.literal("SUM(skukp.skukp)"), "total_skukp"],
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
        var res_tnkb = 0;
        var res_tckb = 0;
        var res_stck = 0;
        var res_skukp = 0;
        for (let j = 0; j < data.bpkb.length; j++) {
          res_bpkb += parseInt(data.bpkb[j].dataValues.total_bpkb);
        }

        for (let j = 0; j < data.stnk.length; j++) {
          res_stnk += parseInt(data.stnk[j].dataValues.total_stnk);
        }

        for (let j = 0; j < data.sim.length; j++) {
          res_sim += parseInt(data.sim[j].dataValues.total_sim);
        }

        for (let j = 0; j < data.tnkb.length; j++) {
          res_tnkb += parseInt(data.tnkb[j].dataValues.total_tnkb);
        }

        for (let j = 0; j < data.tckb.length; j++) {
          res_tckb += parseInt(data.tckb[j].dataValues.total_tckb);
        }

        for (let j = 0; j < data.stck.length; j++) {
          res_stck += parseInt(data.stck[j].dataValues.total_stck);
        }

        for (let j = 0; j < data.skukp.length; j++) {
          res_skukp += parseInt(data.skukp[j].dataValues.total_skukp);
        }

        rows.push({
          id: finals[i].dataValues.id,
          name_polda: finals[i].dataValues.name_polda,
          bpkb: res_bpkb || 0,
          stnk: res_stnk || 0,
          sim: res_sim || 0,
          tnkb: res_tnkb || 0,
          tckb: res_tckb || 0,
          stck: res_stck || 0,
          skukp: res_skukp || 0,
          total:
            res_bpkb +
            res_stnk +
            res_sim +
            res_tnkb +
            res_tckb +
            res_stck +
            res_skukp,
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

      let tnkb = await Tnkb_polda_day.findAll({
        group: groups,
        attributes: [
          custom_attributes,
          [Sequelize.literal("SUM(tnkb)"), "total_tnkb"],
        ],
        raw: true,
        where: wheres,
      });

      let tckb = await Tckb_polda_day.findAll({
        group: groups,
        attributes: [
          custom_attributes,
          [Sequelize.literal("SUM(tckb)"), "total_tckb"],
        ],
        raw: true,
        where: wheres,
      });

      let stck = await Stck_polda_day.findAll({
        group: groups,
        attributes: [
          custom_attributes,
          [Sequelize.literal("SUM(stck)"), "total_stck"],
        ],
        raw: true,
        where: wheres,
      });

      let skukp = await Skukp_polda_day.findAll({
        group: groups,
        attributes: [
          custom_attributes,
          [Sequelize.literal("SUM(skukp)"), "total_skukp"],
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
          let tnkb_data = tnkb.find((x) => x.date == item);
          let tckb_data = tckb.find((x) => x.date == item);
          let stck_data = stck.find((x) => x.date == item);
          let skukp_data = skukp.find((x) => x.date == item);

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

          if (tnkb_data) {
            obj.tnkb = parseInt(tnkb_data.total_tnkb);
          } else {
            obj.tnkb = 0;
          }

          if (tckb_data) {
            obj.tckb = parseInt(tckb_data.total_tckb);
          } else {
            obj.tckb = 0;
          }

          if (stck_data) {
            obj.stck = parseInt(stck_data.total_stck);
          } else {
            obj.stck = 0;
          }

          if (skukp_data) {
            obj.skukp = parseInt(skukp_data.total_skukp);
          } else {
            obj.skukp = 0;
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

          let tnkb_data = tnkb.find(
            (x) => moment(x.month).format("MMMM") == item
          );
          let tckb_data = tckb.find(
            (x) => moment(x.month).format("MMMM") == item
          );
          let stck_data = stck.find(
            (x) => moment(x.month).format("MMMM") == item
          );
          let skukp_data = skukp.find(
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

          if (tnkb_data) {
            obj.tnkb = parseInt(tnkb_data.total_tnkb);
          } else {
            obj.tnkb = 0;
          }

          if (tckb_data) {
            obj.tckb = parseInt(tckb_data.total_tckb);
          } else {
            obj.tckb = 0;
          }

          if (stck_data) {
            obj.stck = parseInt(stck_data.total_stck);
          } else {
            obj.stck = 0;
          }

          if (skukp_data) {
            obj.skukp = parseInt(skukp_data.total_skukp);
          } else {
            obj.skukp = 0;
          }
          finals.push(obj);
        });
      } else if (type === "year") {
        const asd = list_year.map((item, index) => {
          let bpkb_data = bpkb.find(
            (x) => moment(x.year).format("YYYY") == item
          );
          let stnk_data = stnk.find(
            (x) => moment(x.year).format("YYYY") == item
          );
          let sim_data = sim.find((x) => moment(x.year).format("YYYY") == item);
          let tnkb_data = tnkb.find(
            (x) => moment(x.year).format("YYYY") == item
          );
          let tckb_data = tckb.find(
            (x) => moment(x.year).format("YYYY") == item
          );
          let stck_data = stck.find(
            (x) => moment(x.year).format("YYYY") == item
          );
          let skukp_data = skukp.find(
            (x) => moment(x.year).format("YYYY") == item
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

          if (tnkb_data) {
            obj.tnkb = parseInt(tnkb_data.total_tnkb);
          } else {
            obj.tnkb = 0;
          }

          if (tckb_data) {
            obj.tckb = parseInt(tckb_data.total_tckb);
          } else {
            obj.tckb = 0;
          }

          if (stck_data) {
            obj.stck = parseInt(stck_data.total_stck);
          } else {
            obj.stck = 0;
          }

          if (skukp_data) {
            obj.skukp = parseInt(skukp_data.total_skukp);
          } else {
            obj.skukp = 0;
          }

          finals.push(obj);
        });
      }

      response(res, true, "Succeed", finals);
    } catch (error) {
      response(res, false, "Failed", error.message);
    }
  };
};
