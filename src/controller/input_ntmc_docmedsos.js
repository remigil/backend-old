const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const Ntmc_dokmedsos = require("../model/ntmc_dok_medsos");
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
          [
            Sequelize.fn("sum", Sequelize.col("positif_korlantas")),
            "positif_korlantas",
          ],
          [
            Sequelize.fn("sum", Sequelize.col("negatif_korlantas")),
            "negatif_korlantas",
          ],
          [Sequelize.fn("sum", Sequelize.col("lakalantas")), "lakalantas"],
          [
            Sequelize.fn("sum", Sequelize.col("positif_polri")),
            "positif_polri",
          ],
          [
            Sequelize.fn("sum", Sequelize.col("negatif_polri")),
            "negatif_polri",
          ],
          [Sequelize.fn("sum", Sequelize.col("liputan")), "liputan"],
          [
            Sequelize.literal(
              "SUM(positif_korlantas + negatif_korlantas + lakalantas + positif_polri + negatif_polri + liputan)"
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

      let rows = await Ntmc_dokmedsos.findAll(getDataRules);

      let finals = [];
      if (type === "day") {
        const asd = list_day.map((item, index) => {
          const data = rows.find((x) => x.dataValues.date == item);
          if (data) {
            finals.push({
              positif_korlantas: parseInt(data.dataValues.positif_korlantas),
              negatif_korlantas: parseInt(data.dataValues.negatif_korlantas),
              lakalantas: parseInt(data.dataValues.lakalantas),
              positif_polri: parseInt(data.dataValues.positif_polri),
              negatif_polri: parseInt(data.dataValues.negatif_polri),
              liputan: parseInt(data.dataValues.liputan),
              total: parseInt(data.dataValues.total),
              date: data.date,
            });
          } else {
            finals.push({
              positif_korlantas: 0,
              negatif_korlantas: 0,
              lakalantas9: 0,
              positif_polri: 0,
              negatif_polri: 0,
              liputan: 0,
              total: 0,
              date: item,
            });
          }
        });
      } else if (type === "month") {
        let abc = rows.map((element, index) => {
          return {
            positif_korlantas: parseInt(element.dataValues.positif_korlantas),
            negatif_korlantas: parseInt(element.dataValues.negatif_korlantas),
            lakalantas: parseInt(element.dataValues.lakalantas),
            positif_polri: parseInt(element.dataValues.positif_polri),
            negatif_polri: parseInt(element.dataValues.negatif_polri),
            liputan: parseInt(element.dataValues.liputan),
            total: parseInt(element.dataValues.total),
            date: moment(element.dataValues.month).format("MMMM"),
          };
        });

        const asd = list_month.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              positif_korlantas: parseInt(data.positif_korlantas),
              negatif_korlantas: parseInt(data.negatif_korlantas),
              lakalantas: parseInt(data.lakalantas),
              positif_polri: parseInt(data.positif_polri),
              negatif_polri: parseInt(data.negatif_polri),
              liputan: parseInt(data.liputan),
              total: parseInt(data.total),
              date: data.date,
            });
          } else {
            finals.push({
              positif_korlantas: 0,
              negatif_korlantas: 0,
              lakalantas: 0,
              positif_polri: 0,
              negatif_polri: 0,
              liputan: 0,
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
        positif_korlantas: req.body.positif_korlantas,
        negatif_korlantas: req.body.negatif_korlantas,
        lakalantas: req.body.lakalantas,
        positif_polri: req.body.positif_polri,
        negatif_polri: req.body.negatif_polri,
        liputan: req.body.liputan,
        kategori: req.body.kategori,
        date: req.body.date,
      };

      let insertData = await Ntmc_dokmedsos.create(inputData, {
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
