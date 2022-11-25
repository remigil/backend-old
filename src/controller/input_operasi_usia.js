const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const Input_operasi_usia = require("../model/operasi_lg_usia");
const Operasi = require("../model/operation_profile");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");

const Polda = require("../model/polda");

Polda.hasMany(Input_operasi_usia, {
  foreignKey: "polda_id",
  as: "op_usia",
});

const decAes = (token) =>
  AESDecrypt(token, {
    isSafeUrl: true,
    parseMode: "string",
  });
module.exports = class OperasiUsiaController {
  static get = async (req, res) => {
    const {
      polda_id,
      polres_id,
      operasi_id,
      start_date,
      end_date,
      date,
      filter,
      topPolda,
      limit = 34,
      page,
    } = req.query;
    try {
      const wheres = [];
      let wheres_polda_id = {};

      if (polda_id) {
        wheres_polda_id = {
          id: decAes(polda_id),
        };
      }

      if (operasi_id) {
        wheres.push({ operasi_id: decAes(operasi_id) });
      }

      if (date) {
        wheres.push({ date: date });
      }

      if (filter) {
        wheres.push({
          date: {
            [Op.between]: [start_date, end_date],
          },
        });
      }
      let getDataRules = {
        group: ["polda.id"],
        attributes: [
          "id",
          "name_polda",
          [Sequelize.fn("sum", Sequelize.col("max_15")), "max_15"],
          [Sequelize.fn("sum", Sequelize.col("max_20")), "max_20"],
          [Sequelize.fn("sum", Sequelize.col("max_25")), "max_25"],
          [Sequelize.fn("sum", Sequelize.col("max_30")), "max_30"],
          [Sequelize.fn("sum", Sequelize.col("max_35")), "max_35"],
          [Sequelize.fn("sum", Sequelize.col("max_40")), "max_40"],
          [Sequelize.fn("sum", Sequelize.col("max_45")), "max_45"],
          [Sequelize.fn("sum", Sequelize.col("max_50")), "max_50"],
          [Sequelize.fn("sum", Sequelize.col("max_55")), "max_55"],
          [Sequelize.fn("sum", Sequelize.col("max_60")), "max_60"],
          [Sequelize.fn("sum", Sequelize.col("lain_lain")), "lain_lain"],
          [
            Sequelize.literal(
              "SUM(max_15 + max_20 + max_25 + max_30 + max_35 + max_40 + max_45 + max_50 + max_55 + max_60 + lain_lain)"
            ),
            "total",
          ],
        ],
        include: [
          {
            model: Input_operasi_usia,
            required: false,
            as: "op_usia",
            attributes: [],
            where: {
              [Op.and]: wheres,
            },
          },
        ],
        where: wheres_polda_id,
      };
      let finals = await Polda.findAll(getDataRules);

      let rows = [];

      finals.map((element, index) => {
        rows.push({
          id: element.id,
          name_polda: element.name_polda,
          max_15: parseInt(element.dataValues.max_15) || 0,
          max_20: parseInt(element.dataValues.max_20) || 0,
          max_25: parseInt(element.dataValues.max_25) || 0,
          max_30: parseInt(element.dataValues.max_30) || 0,
          max_35: parseInt(element.dataValues.max_35) || 0,
          max_40: parseInt(element.dataValues.max_40) || 0,
          max_45: parseInt(element.dataValues.max_45) || 0,
          max_50: parseInt(element.dataValues.max_50) || 0,
          max_55: parseInt(element.dataValues.max_55) || 0,
          max_60: parseInt(element.dataValues.max_60) || 0,
          lain_lain: parseInt(element.dataValues.lain_lain) || 0,
          total: parseInt(element.dataValues.total) || 0,
        });
      });

      if (topPolda) {
        rows.sort((a, b) => b.total - a.total);
        rows = rows.slice(0, limit);
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
        operasi_id = null,
        serverSide = null,
        length = null,
        start = null,
        polda_id = null,
        topPolda = null,
      } = req.query;

      var list_day = [];
      var list_month = [];

      let operasi = await Operasi.findOne({
        where: {
          id: decAes(operasi_id),
        },
      });

      let start_operation = operasi.dataValues.date_start_operation;
      let end_operation = operasi.dataValues.date_end_operation;

      if (start_date && end_date) {
        start_operation = start_date;
        end_operation = end_date;
      }

      for (
        var m = moment(start_operation);
        m.isSameOrBefore(end_operation);
        m.add(1, "days")
      ) {
        list_day.push(m.format("YYYY-MM-DD"));
      }

      for (
        var m = moment(start_operation);
        m.isSameOrBefore(end_operation);
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

      if (polda_id) {
        wheres.polda_id = decAes(polda_id);
      }

      const getDataRules = {
        attributes: [
          [Sequelize.fn("sum", Sequelize.col("max_15")), "max_15"],
          [Sequelize.fn("sum", Sequelize.col("max_20")), "max_20"],
          [Sequelize.fn("sum", Sequelize.col("max_25")), "max_25"],
          [Sequelize.fn("sum", Sequelize.col("max_30")), "max_30"],
          [Sequelize.fn("sum", Sequelize.col("max_35")), "max_35"],
          [Sequelize.fn("sum", Sequelize.col("max_40")), "max_40"],
          [Sequelize.fn("sum", Sequelize.col("max_45")), "max_45"],
          [Sequelize.fn("sum", Sequelize.col("max_50")), "max_50"],
          [Sequelize.fn("sum", Sequelize.col("max_55")), "max_55"],
          [Sequelize.fn("sum", Sequelize.col("max_60")), "max_60"],
          [Sequelize.fn("sum", Sequelize.col("lain_lain")), "lain_lain"],
          [
            Sequelize.literal(
              "SUM(max_15 + max_20 + max_25 + max_30 + max_35 + max_40 + max_45 + max_50 + max_55 + max_60 + lain_lain)"
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

      let rows = await Input_operasi_usia.findAll(getDataRules);

      let finals = [];
      if (type === "day") {
        const asd = list_day.map((item, index) => {
          const data = rows.find((x) => x.dataValues.date == item);
          console.log(data);
          if (data) {
            finals.push({
              max_15: parseInt(data.dataValues.max_15),
              max_20: parseInt(data.dataValues.max_20),
              max_25: parseInt(data.dataValues.max_25),
              max_30: parseInt(data.dataValues.max_30),
              max_35: parseInt(data.dataValues.max_35),
              max_40: parseInt(data.dataValues.max_40),
              max_45: parseInt(data.dataValues.max_45),
              max_50: parseInt(data.dataValues.max_50),
              max_55: parseInt(data.dataValues.max_55),
              max_60: parseInt(data.dataValues.max_60),
              lain_lain: parseInt(data.dataValues.lain_lain),
              total: parseInt(data.dataValues.total),
              date: data.dataValues.date,
            });
          } else {
            finals.push({
              max_15: 0,
              max_20: 0,
              max_25: 0,
              max_30: 0,
              max_35: 0,
              max_40: 0,
              max_45: 0,
              max_50: 0,
              max_55: 0,
              max_60: 0,
              lain_lain: 0,
              total: 0,
              date: item,
            });
          }
        });
      } else if (type === "month") {
        let abc = rows.map((element, index) => {
          return {
            max_15: parseInt(element.dataValues.max_15),
            max_20: parseInt(element.dataValues.max_20),
            max_25: parseInt(element.dataValues.max_25),
            max_30: parseInt(element.dataValues.max_30),
            max_35: parseInt(element.dataValues.max_35),
            max_40: parseInt(element.dataValues.max_40),
            max_45: parseInt(element.dataValues.max_45),
            max_50: parseInt(element.dataValues.max_50),
            max_55: parseInt(element.dataValues.max_55),
            max_60: parseInt(element.dataValues.max_60),
            lain_lain: parseInt(element.dataValues.lain_lain),
            total: parseInt(element.dataValues.total),
            date: moment(element.dataValues.month).format("MMMM"),
          };
        });

        const asd = list_month.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              max_15: parseInt(data.max_15),
              max_20: parseInt(data.max_20),
              max_25: parseInt(data.max_25),
              max_30: parseInt(data.max_30),
              max_35: parseInt(data.max_35),
              max_40: parseInt(data.max_40),
              max_45: parseInt(data.max_45),
              max_50: parseInt(data.max_50),
              max_55: parseInt(data.max_55),
              max_60: parseInt(data.max_60),
              lain_lain: parseInt(data.lain_lain),
              total: parseInt(data.total),
              date: data.date,
            });
          } else {
            finals.push({
              max_15: 0,
              max_20: 0,
              max_25: 0,
              max_30: 0,
              max_35: 0,
              max_40: 0,
              max_45: 0,
              max_50: 0,
              max_55: 0,
              max_60: 0,
              lain_lain: 0,
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

  // static add = async (req, res) => {
  //   const transaction = await db.transaction();
  //   try {
  //     const { polda } = req.query;
  //     if (polda) {
  //       let dataInputPolda = [];
  //       req.body?.value.map((item) => {
  //         dataInputPolda.push({
  //           polda_id: decAes(req.body.polda_id),
  //           date: req.body.date,
  //           polres_id: decAes(item.polres_id),
  //           operasi_id: decAes(req.body.operasi_id),
  //           max_15: item.max_15,
  //           max_20: item.max_20,
  //           max_25: item.max_25,
  //           max_30: item.max_30,
  //           max_35: item.max_35,
  //           max_40: item.max_40,
  //           max_45: item.max_45,
  //           max_50: item.max_50,
  //           max_55: item.max_55,
  //           max_60: item.max_60,
  //           lain_lain: item.lain_lain,
  //         });
  //       });
  //       let insertDataPolda = await Input_operasi_usia.bulkCreate(
  //         dataInputPolda,
  //         { transaction: transaction }
  //       );
  //     } else {
  //       let checkData = await Input_operasi_usia.findOne({
  //         where: {
  //           polda_id: decAes(req.body.polda_id),
  //           polres_id: decAes(req.body.polres_id),
  //           date: req.body.date,
  //           operasi_id: decAes(req.body.operasi_id),
  //         },
  //       });
  //       let inputData = {
  //         polda_id: decAes(req.body.polda_id),
  //         polres_id: decAes(req.body.polres_id),
  //         date: req.body.date,
  //         operasi_id: decAes(req.body.operasi_id),
  //         max_15: req.body.max_15,
  //         max_20: req.body.max_20,
  //         max_25: req.body.max_25,
  //         max_30: req.body.max_30,
  //         max_35: req.body.max_35,
  //         max_40: req.body.max_40,
  //         max_45: req.body.max_45,
  //         max_50: req.body.max_50,
  //         max_55: req.body.max_55,
  //         max_60: req.body.max_60,
  //         lain_lain: req.body.lain_lain,
  //       };
  //       if (checkData) {
  //         let updateData = await Input_operasi_usia.update(inputData, {
  //           where: {
  //             polda_id: decAes(req.body.polda_id),
  //             polres_id: decAes(req.body.polres_id),
  //             date: req.body.date,
  //             operasi_id: decAes(req.body.operasi_id),
  //           },
  //           transaction: transaction,
  //         });
  //       } else {
  //         let insertData = await Input_operasi_usia.create(inputData, {
  //           transaction: transaction,
  //         });
  //       }
  //     }
  //     await transaction.commit();
  //     response(res, true, "Succeed", null);
  //   } catch (error) {
  //     await transaction.rollback();
  //     response(res, false, "Failed", error.message);
  //   }
  // };

  static add = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let dataInputPolda = [];
      req.body?.value.map((item) => {
        dataInputPolda.push({
          polda_id: decAes(item.polda_id),
          date: item.date,
          operasi_id: decAes(item.operasi_id),
          max_15: item.max_15,
          max_20: item.max_20,
          max_25: item.max_25,
          max_30: item.max_30,
          max_35: item.max_35,
          max_40: item.max_40,
          max_45: item.max_45,
          max_50: item.max_50,
          max_55: item.max_55,
          max_60: item.max_60,
          lain_lain: item.lain_lain,
        });
      });
      let insertDataPolda = await Input_operasi_usia.bulkCreate(
        dataInputPolda,
        { transaction: transaction }
      );
      await transaction.commit();
      response(res, true, "Succeed", null);
    } catch (error) {
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };
};
