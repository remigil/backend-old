const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const Ntmc_aktivitas_pengaduan = require("../model/ntmc_aktivitas_pengaduan");
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
          [Sequelize.fn("sum", Sequelize.col("radio_pjr")), "radio_pjr"],
          [Sequelize.fn("sum", Sequelize.col("sms_9119")), "sms_9119"],
          [Sequelize.fn("sum", Sequelize.col("wa_center")), "wa_center"],
          [Sequelize.fn("sum", Sequelize.col("call_center")), "call_center"],
          [
            Sequelize.literal(
              "SUM(radio_pjr + sms_9119 + wa_center + call_center)"
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

      let rows = await Ntmc_aktivitas_pengaduan.findAll(getDataRules);

      let finals = [];
      if (type === "day") {
        const asd = list_day.map((item, index) => {
          const data = rows.find((x) => x.dataValues.date == item);
          if (data) {
            finals.push({
              radio_pjr: parseInt(data.dataValues.radio_pjr),
              sms_9119: parseInt(data.dataValues.sms_9119),
              wa_center: parseInt(data.dataValues.wa_center),
              call_center: parseInt(data.dataValues.call_center),
              total: parseInt(data.dataValues.total),
              date: data.date,
            });
          } else {
            finals.push({
              radio_pjr: 0,
              sms_9119: 0,
              wa_center9: 0,
              call_center: 0,
              total: 0,
              date: item,
            });
          }
        });
      } else if (type === "month") {
        let abc = rows.map((element, index) => {
          return {
            radio_pjr: parseInt(element.dataValues.radio_pjr),
            sms_9119: parseInt(element.dataValues.sms_9119),
            wa_center: parseInt(element.dataValues.wa_center),
            call_center: parseInt(element.dataValues.call_center),
            total: parseInt(element.dataValues.total),
            date: moment(element.dataValues.month).format("MMMM"),
          };
        });

        const asd = list_month.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              radio_pjr: parseInt(data.radio_pjr),
              sms_9119: parseInt(data.sms_9119),
              wa_center: parseInt(data.wa_center),
              call_center: parseInt(data.call_center),
              total: parseInt(data.total),
              date: data.date,
            });
          } else {
            finals.push({
              radio_pjr: 0,
              sms_9119: 0,
              wa_center: 0,
              call_center: 0,
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
        radio_pjr: req.body.radio_pjr,
        sms_9119: req.body.sms_9119,
        wa_center: req.body.wa_center,
        call_center: req.body.call_center,
        date: req.body.date,
      };

      let insertData = await Ntmc_aktivitas_pengaduan.create(inputData, {
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
