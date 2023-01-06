const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const { Op, Sequelize, where } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");

const Input_operasi_bukti = require("../model/operasi_lg_bukti");
const Input_operasi_dikmaslantas = require("../model/operasi_lg_dikmaslantas");
const Input_operasi_fungsi_jalan = require("../model/operasi_lg_fungsi_jalan");
const Input_operasi_giatlantas = require("../model/operasi_lg_giatlantas");
const Input_operasi_lakaranmor = require("../model/operasi_lk_ranmor");
const Input_operasi_langgarlantas = require("../model/operasi_lg_langgarlantas");
const Input_operasi_kendaraan = require("../model/operasi_lg_kendaraan");
const Input_operasi_lakalantas = require("../model/operasi_lk_lakalantas");
const Input_operasi_langgarmobil = require("../model/operasi_lg_langgar_mobil");
const Input_operasi_langgarmotor = require("../model/operasi_lg_langgar_motor");
const Input_operasi_lokasi_jalan = require("../model/operasi_lg_lokasi_jalan");
const Input_operasi_lokasi_kawasan = require("../model/operasi_lg_lokasi_kawasan");
const Input_operasi_profesi_korban = require("../model/operasi_lk_pekerjaan_korban");
const Input_operasi_profesi_pelaku = require("../model/operasi_lk_pekerjaan_pelaku");
const Input_operasi_pendidikankorban = require("../model/operasi_lk_pendidikan_korban");
const Input_operasi_penyebaran = require("../model/operasi_lg_penyebaran");
const Input_operasi_profesi = require("../model/operasi_lg_profesi");
const Input_operasi_sim = require("../model/operasi_lg_sim");
const Input_operasi_usia = require("../model/operasi_lg_usia");
const Input_operasi_usia_laka_korban = require("../model/operasi_lk_usia_korban");
const Input_operasi_usia_laka_pelaku = require("../model/operasi_lk_usia_pelaku");

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
        operasi_id = null,
        date = null,
        serverSide = null,
        length = null,
        start = null,
        polda_id = null,
        topPolda = null,
      } = req.query;

      const wheres = [];
      if (operasi_id) {
        wheres.push({ operasi_id: decAes(operasi_id) });
      }
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
            model: Input_operasi_bukti,
            required: false,
            as: "op_bukti",
            attributes: [],
            where: {
              [Op.and]: wheres,
            },
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
};
