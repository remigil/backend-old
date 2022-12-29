const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const Input_operasi_penyebaran = require("../model/operasi_lg_penyebaran");
const Operasi = require("../model/operation_profile");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");

const Polda = require("../model/polda");

Polda.hasMany(Input_operasi_penyebaran, {
  foreignKey: "polda_id",
  as: "op_penyebaran",
});

const decAes = (token) =>
  AESDecrypt(token, {
    isSafeUrl: true,
    parseMode: "string",
  });
module.exports = class OperasiPenyebaranController {
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
          [Sequelize.fn("sum", Sequelize.col("spanduk")), "spanduk"],
          [Sequelize.fn("sum", Sequelize.col("leaflet")), "leaflet"],
          [Sequelize.fn("sum", Sequelize.col("billboard")), "billboard"],
          [Sequelize.fn("sum", Sequelize.col("stiker")), "stiker"],
          [
            Sequelize.literal("SUM(spanduk + leaflet + billboard + stiker)"),
            "total",
          ],
        ],
        include: [
          {
            model: Input_operasi_penyebaran,
            required: false,
            as: "op_penyebaran",
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
          spanduk: parseInt(element.dataValues.spanduk) || 0,
          leaflet: parseInt(element.dataValues.leaflet) || 0,
          billboard: parseInt(element.dataValues.billboard) || 0,
          stiker: parseInt(element.dataValues.stiker) || 0,
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
      var list_year = [];

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

      for (
        var m = moment(start_operation);
        m.isSameOrBefore(end_operation);
        m.add(1, "year")
      ) {
        list_year.push(m.format("YYYY"));
      }

      let wheres = [];
      if (date) {
        wheres.push({
          date: date,
        });
      }

      if (filter) {
        wheres.push({
          date: {
            [Op.between]: [start_date, end_date],
          },
        });
      }

      if (polda_id) {
        wheres.push({
          polda_id: decAes(polda_id),
        });
      }

      if (operasi_id) {
        wheres.push({
          operasi_id: decAes(operasi_id),
        });
      }

      const getDataRules = {
        attributes: [
          [Sequelize.fn("sum", Sequelize.col("spanduk")), "spanduk"],
          [Sequelize.fn("sum", Sequelize.col("leaflet")), "leaflet"],
          [Sequelize.fn("sum", Sequelize.col("billboard")), "billboard"],
          [Sequelize.fn("sum", Sequelize.col("stiker")), "stiker"],
          [
            Sequelize.literal("SUM(spanduk + leaflet + billboard + stiker)"),
            "total",
          ],
        ],
        where: {
          [Op.and]: wheres,
        },
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
      } else if (type === "year") {
        getDataRules.group = "year";
        getDataRules.attributes.push([
          Sequelize.fn("date_trunc", "year", Sequelize.col("date")),
          "year",
        ]);
      }

      let rows = await Input_operasi_penyebaran.findAll(getDataRules);

      let finals = [];
      if (type === "day") {
        const asd = list_day.map((item, index) => {
          const data = rows.find((x) => x.dataValues.date == item);
          console.log(data);
          if (data) {
            finals.push({
              spanduk: parseInt(data.dataValues.spanduk),
              leaflet: parseInt(data.dataValues.leaflet),
              billboard: parseInt(data.dataValues.billboard),
              stiker: parseInt(data.dataValues.stiker),
              total: parseInt(data.dataValues.total),
              date: data.dataValues.date,
            });
          } else {
            finals.push({
              spanduk: 0,
              leaflet: 0,
              billboard: 0,
              stiker: 0,
              total: 0,
              date: item,
            });
          }
        });
      } else if (type === "month") {
        let abc = rows.map((element, index) => {
          return {
            spanduk: parseInt(element.dataValues.spanduk),
            leaflet: parseInt(element.dataValues.leaflet),
            billboard: parseInt(element.dataValues.billboard),
            stiker: parseInt(element.dataValues.stiker),
            total: parseInt(element.dataValues.total),
            date: moment(element.dataValues.month).format("MMMM"),
          };
        });

        const asd = list_month.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              spanduk: parseInt(data.spanduk),
              leaflet: parseInt(data.leaflet),
              billboard: parseInt(data.billboard),
              stiker: parseInt(data.stiker),
              total: parseInt(data.total),
              date: data.date,
            });
          } else {
            finals.push({
              spanduk: 0,
              leaflet: 0,
              billboard: 0,
              stiker: 0,
              total: 0,
              date: item,
            });
          }
        });
      } else if (type === "year") {
        let abc = rows.map((element, index) => {
          return {
            spanduk: parseInt(element.dataValues.spanduk),
            leaflet: parseInt(element.dataValues.leaflet),
            billboard: parseInt(element.dataValues.billboard),
            stiker: parseInt(element.dataValues.stiker),
            total: parseInt(element.dataValues.total),
            date: moment(element.dataValues.year).format("YYYY"),
          };
        });

        const asd = list_year.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              spanduk: parseInt(data.spanduk),
              leaflet: parseInt(data.leaflet),
              billboard: parseInt(data.billboard),
              stiker: parseInt(data.stiker),
              total: parseInt(data.total),
              date: data.date,
            });
          } else {
            finals.push({
              spanduk: 0,
              leaflet: 0,
              billboard: 0,
              stiker: 0,
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
  //           spanduk: item.spanduk,
  //           leaflet: item.leaflet,
  //           billboard: item.billboard,
  //           stiker: item.stiker,
  //         });
  //       });
  //       let insertDataPolda = await Input_operasi_penyebaran.bulkCreate(
  //         dataInputPolda,
  //         { transaction: transaction }
  //       );
  //     } else {
  //       let checkData = await Input_operasi_penyebaran.findOne({
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
  //         spanduk: req.body.spanduk,
  //         leaflet: req.body.leaflet,
  //         billboard: req.body.billboard,
  //         stiker: req.body.stiker,
  //       };
  //       if (checkData) {
  //         let updateData = await Input_operasi_penyebaran.update(inputData, {
  //           where: {
  //             polda_id: decAes(req.body.polda_id),
  //             polres_id: decAes(req.body.polres_id),
  //             date: req.body.date,
  //             operasi_id: decAes(req.body.operasi_id),
  //           },
  //           transaction: transaction,
  //         });
  //       } else {
  //         let insertData = await Input_operasi_penyebaran.create(inputData, {
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
          spanduk: item.spanduk,
          leaflet: item.leaflet,
          billboard: item.billboard,
          stiker: item.stiker,
        });
      });
      let insertDataPolda = await Input_operasi_penyebaran.bulkCreate(
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
