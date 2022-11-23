const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const Ntmc_aktivitas_radio = require("../model/ntmc_aktivitas_radio");
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
          [Sequelize.fn("sum", Sequelize.col("gen_fm")), "gen_fm"],
          [Sequelize.fn("sum", Sequelize.col("jak_fm")), "jak_fm"],
          [Sequelize.fn("sum", Sequelize.col("most_fm")), "most_fm"],
          [Sequelize.fn("sum", Sequelize.col("kiss_fm")), "kiss_fm"],
          [
            Sequelize.literal("SUM(gen_fm + jak_fm + most_fm + kiss_fm)"),
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

      let rows = await Ntmc_aktivitas_radio.findAll(getDataRules);

      let finals = [];
      if (type === "day") {
        const asd = list_day.map((item, index) => {
          const data = rows.find((x) => x.dataValues.date == item);
          if (data) {
            finals.push({
              gen_fm: parseInt(data.dataValues.gen_fm),
              jak_fm: parseInt(data.dataValues.jak_fm),
              most_fm: parseInt(data.dataValues.most_fm),
              kiss_fm: parseInt(data.dataValues.kiss_fm),
              total: parseInt(data.dataValues.total),
              date: data.date,
            });
          } else {
            finals.push({
              gen_fm: 0,
              jak_fm: 0,
              most_fm9: 0,
              kiss_fm: 0,
              total: 0,
              date: item,
            });
          }
        });
      } else if (type === "month") {
        let abc = rows.map((element, index) => {
          return {
            gen_fm: parseInt(element.dataValues.gen_fm),
            jak_fm: parseInt(element.dataValues.jak_fm),
            most_fm: parseInt(element.dataValues.most_fm),
            kiss_fm: parseInt(element.dataValues.kiss_fm),
            total: parseInt(element.dataValues.total),
            date: moment(element.dataValues.month).format("MMMM"),
          };
        });

        const asd = list_month.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              gen_fm: parseInt(data.gen_fm),
              jak_fm: parseInt(data.jak_fm),
              most_fm: parseInt(data.most_fm),
              kiss_fm: parseInt(data.kiss_fm),
              total: parseInt(data.total),
              date: data.date,
            });
          } else {
            finals.push({
              gen_fm: 0,
              jak_fm: 0,
              most_fm: 0,
              kiss_fm: 0,
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
        gen_fm: req.body.gen_fm,
        jak_fm: req.body.jak_fm,
        most_fm: req.body.most_fm,
        kiss_fm: req.body.kiss_fm,
        date: req.body.date,
      };

      let insertData = await Ntmc_aktivitas_radio.create(inputData, {
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
