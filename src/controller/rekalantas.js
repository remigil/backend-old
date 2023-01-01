const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const Input_rekalantas = require("../model/rekalantas");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");

const Count_polda_day = require("../model/rekalantas");
// const Count_polda_month = require("../model/count_rekalantas_polda_month");
// const Count_polres_month = require("../model/count_rekalantas_polres_month");
const Polda = require("../model/polda");
const Polres = require("../model/polres");

// Count_polda_month.belongsTo(Polda, { foreignKey: "polda_id", as: "polda" });
// Count_polda_day.belongsTo(Polda, { foreignKey: "polda_id", as: "polda" });
Polda.hasMany(Count_polda_day, { foreignKey: "polda_id", as: "rekalantas" });
// Polda.hasMany(Count_polda_month, {
//   foreignKey: "polda_id",
//   as: "rekalantas-month",
// });
// Count_polres_month.belongsTo(Polda, { foreignKey: "polda_id", as: "polda" });
// Count_polres_month.belongsTo(Polres, { foreignKey: "polres_id", as: "polres" });

const decAes = (token) =>
  AESDecrypt(token, {
    isSafeUrl: true,
    parseMode: "string",
  });

module.exports = class RekalantasController {
  static get_daily = async (req, res) => {
    const modelAttr = Object.keys(Count_polda_day.getAttributes());
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
        limit = 34,
      } = req.query;
      const getDataRules = {
        group: ["polda.id"],
        attributes: [
          "id",
          "name_polda",
          [
            Sequelize.fn("sum", Sequelize.col("jalan_nasional")),
            "jalan_nasional",
          ],
          [
            Sequelize.fn("sum", Sequelize.col("jalan_provinsi")),
            "jalan_provinsi",
          ],
          [Sequelize.fn("sum", Sequelize.col("lain_lain")), "lain_lain"],
          [
            Sequelize.literal(
              "SUM(jalan_nasional + jalan_provinsi + lain_lain)"
            ),
            "total",
          ],
        ],
        include: [
          {
            model: Count_polda_day,
            required: false,
            as: "rekalantas",
            attributes: [],
          },
        ],
        nest: true,
        subQuery: false,
      };

      if (date) {
        getDataRules.include[0].where = {
          date: date,
        };
      }

      if (filter) {
        getDataRules.include[0].where = {
          date: {
            [Op.between]: [start_date, end_date],
          },
        };
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
      const count = await Polda.count({
        where: getDataRules?.where,
      });

      let rows = [];

      finals.map((element, index) => {
        rows.push({
          id: element.id,
          name_polda: element.name_polda,
          jalan_nasional: parseInt(element.dataValues.jalan_nasional) || 0,
          jalan_provinsi: parseInt(element.dataValues.jalan_provinsi) || 0,
          lain_lain: parseInt(element.dataValues.lain_lain) || 0,
          total: parseInt(element.dataValues.total) || 0,
        });
      });

      if (topPolda) {
        rows.sort((a, b) => b.total - a.total);
        rows = rows.slice(0, limit);
      }
      response(res, true, "Succeed", {
        rows,
        recordsFiltered: count,
        recordsTotal: count,
      });
    } catch (error) {
      response(res, false, "Failed", error.message);
    }
  };

  static get_monthly = async (req, res) => {
    const modelAttr = Object.keys(Count_polda_day.getAttributes());
    try {
      const {
        start_month = null,
        end_month = null,
        filter = null,
        month = null,
        serverSide = null,
        length = null,
        start = null,
        polda_id = null,
        topPolda = null,
        limit = 34,
      } = req.query;
      const getDataRules = {
        group: ["polda.id"],
        attributes: [
          "id",
          "name_polda",
          [
            Sequelize.fn("sum", Sequelize.col("jalan_nasional")),
            "jalan_nasional",
          ],
          [
            Sequelize.fn("sum", Sequelize.col("jalan_provinsi")),
            "jalan_provinsi",
          ],
          [Sequelize.fn("sum", Sequelize.col("lain_lain")), "lain_lain"],
          [
            Sequelize.literal(
              "SUM(jalan_nasional + jalan_provinsi + lain_lain)"
            ),
            "total",
          ],
        ],
        include: [
          {
            model: Count_polda_month,
            required: false,
            as: "rekalantas-month",
            attributes: [],
          },
        ],
        nest: true,
        subQuery: false,
      };

      if (month) {
        getDataRules.include[0].where = {
          date: month,
        };
      }

      if (filter) {
        getDataRules.include[0].where = {
          date: {
            [Op.between]: [start_month, end_month],
          },
        };
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
      const count = await Polda.count({
        where: getDataRules?.where,
      });

      let rows = [];

      finals.map((element, index) => {
        rows.push({
          id: element.id,
          name_polda: element.name_polda,
          jalan_nasional: parseInt(element.dataValues.jalan_nasional) || 0,
          jalan_provinsi: parseInt(element.dataValues.jalan_provinsi) || 0,
          lain_lain: parseInt(element.dataValues.lain_lain) || 0,
          total: parseInt(element.dataValues.total) || 0,
        });
      });

      if (topPolda) {
        rows.sort((a, b) => b.total - a.total);
        rows = rows.slice(0, limit);
      }
      response(res, true, "Succeed", {
        rows,
        recordsFiltered: count,
        recordsTotal: count,
      });
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
          [
            Sequelize.fn("sum", Sequelize.col("jalan_nasional")),
            "jalan_nasional",
          ],
          [
            Sequelize.fn("sum", Sequelize.col("jalan_provinsi")),
            "jalan_provinsi",
          ],
          [Sequelize.fn("sum", Sequelize.col("lain_lain")), "lain_lain"],
          [
            Sequelize.literal(
              "SUM(jalan_nasional + jalan_provinsi + lain_lain)"
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
      } else if (type === "year") {
        getDataRules.group = "year";
        getDataRules.attributes.push([
          Sequelize.fn("date_trunc", "year", Sequelize.col("date")),
          "year",
        ]);
      }

      let rows = await Count_polda_day.findAll(getDataRules);

      let finals = [];
      if (type === "day") {
        const asd = list_day.map((item, index) => {
          const data = rows.find((x) => x.dataValues.date == item);
          console.log(data);
          if (data) {
            finals.push({
              jalan_nasional: parseInt(data.dataValues.jalan_nasional),
              lain_lain: parseInt(data.dataValues.lain_lain),
              jalan_provinsi: parseInt(data.dataValues.jalan_provinsi),
              total: parseInt(data.dataValues.total),
              date: data.date,
            });
          } else {
            finals.push({
              jalan_nasional: 0,
              lain_lain: 0,
              jalan_provinsi: 0,
              total: 0,
              date: item,
            });
          }
        });
      } else if (type === "month") {
        let abc = rows.map((element, index) => {
          return {
            jalan_nasional: parseInt(element.dataValues.jalan_nasional),
            lain_lain: parseInt(element.dataValues.lain_lain),
            jalan_provinsi: parseInt(element.dataValues.jalan_provinsi),
            total: parseInt(element.dataValues.total),
            date: moment(element.dataValues.month).format("MMMM"),
          };
        });

        const asd = list_month.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              jalan_nasional: parseInt(data.jalan_nasional),
              lain_lain: parseInt(data.lain_lain),
              jalan_provinsi: parseInt(data.jalan_provinsi),
              total: parseInt(data.total),
              date: data.date,
            });
          } else {
            finals.push({
              jalan_nasional: 0,
              lain_lain: 0,
              jalan_provinsi: 0,
              total: 0,
              date: item,
            });
          }
        });
      } else if (type === "year") {
        let abc = rows.map((element, index) => {
          return {
            jalan_nasional: parseInt(element.dataValues.jalan_nasional),
            lain_lain: parseInt(element.dataValues.lain_lain),
            jalan_provinsi: parseInt(element.dataValues.jalan_provinsi),
            total: parseInt(element.dataValues.total),
            date: moment(element.dataValues.month).format("YYYY"),
          };
        });

        const asd = list_year.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              jalan_nasional: parseInt(data.jalan_nasional),
              lain_lain: parseInt(data.lain_lain),
              jalan_provinsi: parseInt(data.jalan_provinsi),
              total: parseInt(data.total),
              date: data.date,
            });
          } else {
            finals.push({
              jalan_nasional: 0,
              lain_lain: 0,
              jalan_provinsi: 0,
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
  //           lain_lain: item.lain_lain,
  //           billboard: item.billboard,
  //           jalan_provinsi: item.jalan_provinsi,
  //           jalan_nasional: item.jalan_nasional,
  //           jemensosprek: item.jemensosprek,
  //         });
  //       });
  //       let insertDataPolda = await Input_rekalantas.bulkCreate(
  //         dataInputPolda,
  //         { transaction: transaction }
  //       );
  //     } else {
  //       let checkData = await Input_rekalantas.findOne({
  //         where: {
  //           polda_id: decAes(req.body.polda_id),
  //           polres_id: decAes(req.body.polres_id),
  //           date: req.body.date,
  //         },
  //       });
  //       let inputData = {
  //         polda_id: decAes(req.body.polda_id),
  //         polres_id: decAes(req.body.polres_id),
  //         date: req.body.date,
  //         lain_lain: req.body.lain_lain,
  //         jalan_provinsi: req.body.jalan_provinsi,
  //         billboard: req.body.billboard,
  //         jalan_nasional: req.body.jalan_nasional,
  //         jemensosprek: req.body.jemensosprek,
  //       };
  //       if (checkData) {
  //         let updateData = await Input_rekalantas.update(inputData, {
  //           where: {
  //             polda_id: decAes(req.body.polda_id),
  //             polres_id: decAes(req.body.polres_id),
  //             date: req.body.date,
  //           },
  //           transaction: transaction,
  //         });
  //       } else {
  //         let insertData = await Input_rekalantas.create(inputData, {
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
          lain_lain: item.lain_lain,
          billboard: item.billboard,
          jalan_provinsi: item.jalan_provinsi,
          jalan_nasional: item.jalan_nasional,
          jemensosprek: item.jemensosprek,
        });
      });
      let insertDataPolda = await Count_polda_day.bulkCreate(dataInputPolda, {
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
