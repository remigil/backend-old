const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");
const Count_polda_day = require("../model/count_lapMasyarakat_polda_day");
const Count_polda_month = require("../model/count_lapMasyarakat_polda_month");
const Polda = require("../model/polda");

const decAes = (token) =>
  AESDecrypt(token, {
    isSafeUrl: true,
    parseMode: "string",
  });

Polda.hasMany(Count_polda_day, {
  foreignKey: "polda_id",
  as: "lapMasyarakat",
});
Polda.hasMany(Count_polda_month, {
  foreignKey: "polda_id",
  as: "lapMasyarakat-month",
});

module.exports = class OperasiSimController {
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
      } = req.query;
      const getDataRules = {
        group: ["polda.id"],
        attributes: [
          "id",
          "name_polda",
          [Sequelize.fn("sum", Sequelize.col("tegur_prokes")), "tegur_prokes"],
          [Sequelize.fn("sum", Sequelize.col("masker")), "masker"],
          [
            Sequelize.fn("sum", Sequelize.col("sosial_prokes")),
            "sosial_prokes",
          ],
          [Sequelize.fn("sum", Sequelize.col("baksos")), "baksos"],
          [
            Sequelize.literal(
              "SUM(tegur_prokes + masker + sosial_prokes + baksos)"
            ),
            "total",
          ],
        ],
        include: [
          {
            model: Count_polda_day,
            required: false,
            as: "lapMasyarakat",
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
          tegur_prokes: parseInt(element.dataValues.tegur_prokes) || 0,
          masker: parseInt(element.dataValues.masker) || 0,
          sosial_prokes: parseInt(element.dataValues.sosial_prokes) || 0,
          baksos: parseInt(element.dataValues.baksos) || 0,
          total: parseInt(element.dataValues.total) || 0,
        });
      });

      if (topPolda) {
        rows.sort((a, b) => b.total - a.total);
        rows = rows.slice(0, 10);
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
      } = req.query;
      const getDataRules = {
        group: ["polda.id"],
        attributes: [
          "id",
          "name_polda",
          [Sequelize.fn("sum", Sequelize.col("tegur_prokes")), "tegur_prokes"],
          [Sequelize.fn("sum", Sequelize.col("masker")), "masker"],
          [
            Sequelize.fn("sum", Sequelize.col("sosial_prokes")),
            "sosial_prokes",
          ],
          [Sequelize.fn("sum", Sequelize.col("baksos")), "baksos"],
          [
            Sequelize.literal(
              "SUM(tegur_prokes + masker + sosial_prokes + baksos)"
            ),
            "total",
          ],
        ],
        include: [
          {
            model: Count_polda_month,
            required: false,
            as: "lapMasyarakat-month",
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
          tegur_prokes: parseInt(element.dataValues.tegur_prokes) || 0,
          masker: parseInt(element.dataValues.masker) || 0,
          sosial_prokes: parseInt(element.dataValues.sosial_prokes) || 0,
          baksos: parseInt(element.dataValues.baksos) || 0,
          total: parseInt(element.dataValues.total) || 0,
        });
      });

      if (topPolda) {
        rows.sort((a, b) => b.total - a.total);
        rows = rows.slice(0, 10);
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

      if (polda_id) {
        wheres.polda_id = decAes(polda_id);
      }

      const getDataRules = {
        attributes: [
          [Sequelize.fn("sum", Sequelize.col("tegur_prokes")), "tegur_prokes"],
          [Sequelize.fn("sum", Sequelize.col("masker")), "masker"],
          [
            Sequelize.fn("sum", Sequelize.col("sosial_prokes")),
            "sosial_prokes",
          ],
          // [Sequelize.fn("date_trunc", "month", Sequelize.col("date")), "year"],
          [Sequelize.fn("sum", Sequelize.col("baksos")), "baksos"],
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

      let rows = await Count_polda_day.findAll(getDataRules);

      let finals = [];
      if (type === "day") {
        const asd = list_day.map((item, index) => {
          const data = rows.find((x) => x.dataValues.date == item);
          if (data) {
            finals.push({
              tegur_prokes: parseInt(data.tegur_prokes),
              sosial_prokes: parseInt(data.sosial_prokes),
              masker: parseInt(data.masker),
              baksos: parseInt(data.baksos),
              date: data.date,
            });
          } else {
            finals.push({
              tegur_prokes: 0,
              sosial_prokes: 0,
              masker: 0,
              baksos: 0,
              date: item,
            });
          }
        });
      } else if (type === "month") {
        let abc = rows.map((element, index) => {
          return {
            tegur_prokes: parseInt(element.dataValues.tegur_prokes),
            sosial_prokes: parseInt(element.dataValues.sosial_prokes),
            masker: parseInt(element.dataValues.masker),
            baksos: parseInt(element.dataValues.baksos),
            date: moment(element.dataValues.month).format("MMMM"),
          };
        });

        const asd = list_month.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              tegur_prokes: parseInt(data.tegur_prokes),
              sosial_prokes: parseInt(data.sosial_prokes),
              masker: parseInt(data.masker),
              baksos: parseInt(data.baksos),
              date: data.date,
            });
          } else {
            finals.push({
              tegur_prokes: 0,
              sosial_prokes: 0,
              masker: 0,
              baksos: 0,
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
  //           baksos: item.baksos,
  //           sosial_prokes: item.sosial_prokes,
  //           masker: item.masker,
  //           tegur_prokes: item.tegur_prokes,
  //         });
  //       });
  //       let insertDataPolda = await Input_masyarakat.bulkCreate(
  //         dataInputPolda,
  //         { transaction: transaction }
  //       );
  //     } else {
  //       let checkData = await Input_masyarakat.findOne({
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
  //         baksos: req.body.baksos,
  //         sosial_prokes: req.body.sosial_prokes,
  //         masker: req.body.masker,
  //         tegur_prokes: req.body.tegur_prokes,
  //       };
  //       if (checkData) {
  //         let updateData = await Input_masyarakat.update(inputData, {
  //           where: {
  //             polda_id: decAes(req.body.polda_id),
  //             polres_id: decAes(req.body.polres_id),
  //             date: req.body.date,
  //           },
  //           transaction: transaction,
  //         });
  //       } else {
  //         let insertData = await Input_masyarakat.create(inputData, {
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
          baksos: item.baksos,
          sosial_prokes: item.sosial_prokes,
          masker: item.masker,
          tegur_prokes: item.tegur_prokes,
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
