const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const Input_operasi_usia = require("../model/operasi_lk_usia_korban");
const Operasi = require("../model/operation_profile");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");

const Polda = require("../model/polda");

Polda.hasMany(Input_operasi_usia, {
  foreignKey: "polda_id",
  as: "op_usia_korban",
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
          [Sequelize.fn("sum", Sequelize.col("max_4")), "max_4"],
          [Sequelize.fn("sum", Sequelize.col("max_9")), "max_9"],
          [Sequelize.fn("sum", Sequelize.col("max_14")), "max_14"],
          [Sequelize.fn("sum", Sequelize.col("max_19")), "max_19"],
          [Sequelize.fn("sum", Sequelize.col("max_24")), "max_24"],
          [Sequelize.fn("sum", Sequelize.col("max_34")), "max_34"],
          [Sequelize.fn("sum", Sequelize.col("max_39")), "max_39"],
          [Sequelize.fn("sum", Sequelize.col("max_54")), "max_54"],
          [Sequelize.fn("sum", Sequelize.col("max_59")), "max_59"],
          [Sequelize.fn("sum", Sequelize.col("lain_lain")), "lain_lain"],
          [
            Sequelize.literal(
              "SUM(max_4 + max_9 + max_14 + max_19 + max_24 + max_34 + max_39 + max_54 + max_59 + lain_lain)"
            ),
            "total",
          ],
        ],
        include: [
          {
            model: Input_operasi_usia,
            required: false,
            as: "op_usia_korban",
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
          max_4: parseInt(element.dataValues.max_4) || 0,
          max_9: parseInt(element.dataValues.max_9) || 0,
          max_14: parseInt(element.dataValues.max_14) || 0,
          max_19: parseInt(element.dataValues.max_19) || 0,
          max_24: parseInt(element.dataValues.max_24) || 0,
          max_34: parseInt(element.dataValues.max_34) || 0,
          max_39: parseInt(element.dataValues.max_39) || 0,
          max_54: parseInt(element.dataValues.max_54) || 0,
          max_59: parseInt(element.dataValues.max_59) || 0,
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
          [Sequelize.fn("sum", Sequelize.col("max_4")), "max_4"],
          [Sequelize.fn("sum", Sequelize.col("max_9")), "max_9"],
          [Sequelize.fn("sum", Sequelize.col("max_14")), "max_14"],
          [Sequelize.fn("sum", Sequelize.col("max_19")), "max_19"],
          [Sequelize.fn("sum", Sequelize.col("max_24")), "max_24"],
          [Sequelize.fn("sum", Sequelize.col("max_34")), "max_34"],
          [Sequelize.fn("sum", Sequelize.col("max_39")), "max_39"],
          [Sequelize.fn("sum", Sequelize.col("max_54")), "max_54"],
          [Sequelize.fn("sum", Sequelize.col("max_59")), "max_59"],
          [Sequelize.fn("sum", Sequelize.col("lain_lain")), "lain_lain"],
          [
            Sequelize.literal(
              "SUM(max_4 + max_9 + max_14 + max_19 + max_24 + max_34 + max_39 + max_54 + max_59 + lain_lain)"
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
              max_4: parseInt(data.dataValues.max_4),
              max_9: parseInt(data.dataValues.max_9),
              max_14: parseInt(data.dataValues.max_14),
              max_19: parseInt(data.dataValues.max_19),
              max_24: parseInt(data.dataValues.max_24),
              max_34: parseInt(data.dataValues.max_34),
              max_39: parseInt(data.dataValues.max_39),
              max_54: parseInt(data.dataValues.max_54),
              max_59: parseInt(data.dataValues.max_59),
              lain_lain: parseInt(data.dataValues.lain_lain),
              total: parseInt(data.dataValues.total),
              date: data.dataValues.date,
            });
          } else {
            finals.push({
              max_4: 0,
              max_9: 0,
              max_14: 0,
              max_19: 0,
              max_24: 0,
              max_34: 0,
              max_39: 0,
              max_54: 0,
              max_59: 0,
              lain_lain: 0,
              total: 0,
              date: item,
            });
          }
        });
      } else if (type === "month") {
        let abc = rows.map((element, index) => {
          return {
            max_4: parseInt(element.dataValues.max_4),
            max_9: parseInt(element.dataValues.max_9),
            max_14: parseInt(element.dataValues.max_14),
            max_19: parseInt(element.dataValues.max_19),
            max_24: parseInt(element.dataValues.max_24),
            max_34: parseInt(element.dataValues.max_34),
            max_39: parseInt(element.dataValues.max_39),
            max_54: parseInt(element.dataValues.max_54),
            max_59: parseInt(element.dataValues.max_59),
            lain_lain: parseInt(element.dataValues.lain_lain),
            total: parseInt(element.dataValues.total),
            date: moment(element.dataValues.month).format("MMMM"),
          };
        });

        const asd = list_month.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              max_4: parseInt(data.max_4),
              max_9: parseInt(data.max_9),
              max_14: parseInt(data.max_14),
              max_19: parseInt(data.max_19),
              max_24: parseInt(data.max_24),
              max_34: parseInt(data.max_34),
              max_39: parseInt(data.max_39),
              max_54: parseInt(data.max_54),
              max_59: parseInt(data.max_59),
              lain_lain: parseInt(data.lain_lain),
              total: parseInt(data.total),
              date: data.date,
            });
          } else {
            finals.push({
              max_4: 0,
              max_9: 0,
              max_14: 0,
              max_19: 0,
              max_24: 0,
              max_34: 0,
              max_39: 0,
              max_54: 0,
              max_59: 0,
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
  //           max_4: item.max_4,
  //           max_9: item.max_9,
  //           max_14: item.max_14,
  //           max_19: item.max_19,
  //           max_24: item.max_24,
  //           max_29: item.max_29,
  //           max_34: item.max_34,
  //           max_39: item.max_39,
  //           max_54: item.max_54,
  //           max_59: item.max_59,
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
  //         max_4: req.body.max_4,
  //         max_9: req.body.max_9,
  //         max_14: req.body.max_14,
  //         max_19: req.body.max_19,
  //         max_24: req.body.max_24,
  //         max_29: req.body.max_29,
  //         max_34: req.body.max_34,
  //         max_39: req.body.max_39,
  //         max_54: req.body.max_54,
  //         max_59: req.body.max_59,
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
          max_4: item.max_4,
          max_9: item.max_9,
          max_14: item.max_14,
          max_19: item.max_19,
          max_24: item.max_24,
          max_29: item.max_29,
          max_34: item.max_34,
          max_39: item.max_39,
          max_54: item.max_54,
          max_59: item.max_59,
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
