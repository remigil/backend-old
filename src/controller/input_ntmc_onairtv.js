const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const Ntmc_onair_tv = require("../model/ntmc_onair_mediatv");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");

module.exports = class NtmcOnAirTVController {
  static get_by_date = async (req, res) => {
    let start_of_month = moment().startOf("years").format("YYYY-MM-DD");
    let end_of_month = moment().endOf("years").format("YYYY-MM-DD");
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

      var list_day = [];
      var list_month = [];

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

      let wheres = {};
      if (date) {
        wheres.date = date;
      }

      if (filter) {
        wheres.date = {
          [Op.between]: [start_date, end_date],
        };
      }

      const getDataRules = {
        attributes: [
          [Sequelize.fn("sum", Sequelize.col("program")), "program"],
          [Sequelize.fn("sum", Sequelize.col("live_report")), "live_report"],
          [Sequelize.fn("sum", Sequelize.col("live_program")), "live_program"],
          [Sequelize.fn("sum", Sequelize.col("tapping")), "tapping"],
          [Sequelize.fn("sum", Sequelize.col("vlog_cctv")), "vlog_cctv"],
          [
            Sequelize.literal(
              "SUM(program + live_report + live_program + tapping + vlog_cctv)"
            ),
            "total",
          ],
        ],
        where: wheres,
      };

      if (type === "day") {
        getDataRules.group = "date";
        getDataRules.attributes.push("date");
      } else if (type === "month") {
        getDataRules.group = "month";
        getDataRules.attributes.push([
          Sequelize.fn("date_trunc", "month", Sequelize.col("date")),
          "month",
        ]);
      }

      let rows = await Ntmc_onair_tv.findAll(getDataRules);

      let finals = [];
      if (type === "day") {
        const asd = list_day.map((item, index) => {
          const data = rows.find((x) => x.dataValues.date == item);
          if (data) {
            finals.push({
              program: parseInt(data.dataValues.program),
              live_report: parseInt(data.dataValues.live_report),
              live_program: parseInt(data.dataValues.live_program),
              tapping: parseInt(data.dataValues.tapping),
              vlog_cctv: parseInt(data.dataValues.vlog_cctv),
              total: parseInt(data.dataValues.total),
              date: data.date,
            });
          } else {
            finals.push({
              program: 0,
              live_report: 0,
              live_program9: 0,
              tapping: 0,
              vlog_cctv: 0,
              total: 0,
              date: item,
            });
          }
        });
      } else if (type === "month") {
        let abc = rows.map((element, index) => {
          return {
            program: parseInt(element.dataValues.program),
            live_report: parseInt(element.dataValues.live_report),
            live_program: parseInt(element.dataValues.live_program),
            tapping: parseInt(element.dataValues.tapping),
            vlog_cctv: parseInt(element.dataValues.vlog_cctv),
            total: parseInt(element.dataValues.total),
            date: moment(element.dataValues.month).format("MMMM"),
          };
        });

        const asd = list_month.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              program: parseInt(data.program),
              live_report: parseInt(data.live_report),
              live_program: parseInt(data.live_program),
              tapping: parseInt(data.tapping),
              total: parseInt(data.total),
              date: data.date,
            });
          } else {
            finals.push({
              program: 0,
              live_report: 0,
              live_program: 0,
              tapping: 0,
              vlog_cctv: 0,
              total: 0,
              date: item,
            });
          }
        });
      }
      response(res, true, "Succeed", finals);
    } catch (error) {
      response(res, false, "Failed", error.message);
    }
  };

  static add = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let inputData = {
        program: req.body.program,
        live_report: req.body.live_report,
        live_program: req.body.live_program,
        tapping: req.body.tapping,
        vlog_cctv: req.body.vlog_cctv,
        date: req.body.date,
      };

      let insertData = await Ntmc_onair_tv.create(inputData, {
        transaction: transaction,
      });
      await transaction.commit();
      response(res, true, "Succeed", null);
    } catch (error) {
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };
};
