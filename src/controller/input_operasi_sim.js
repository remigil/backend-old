const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const Input_operasi_sim = require("../model/operasi_lg_sim");
const Operasi = require("../model/operation_profile");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");

const Polda = require("../model/polda");

Polda.hasMany(Input_operasi_sim, {
  foreignKey: "polda_id",
  as: "op_sim",
});

const decAes = (token) =>
  AESDecrypt(token, {
    isSafeUrl: true,
    parseMode: "string",
  });
module.exports = class OperasiSimController {
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
          [Sequelize.fn("sum", Sequelize.col("sim_a")), "sim_a"],
          [Sequelize.fn("sum", Sequelize.col("sim_a_umum")), "sim_a_umum"],
          [Sequelize.fn("sum", Sequelize.col("sim_b")), "sim_b"],
          [
            Sequelize.fn("sum", Sequelize.col("sim_b_satu_umum")),
            "sim_b_satu_umum",
          ],
          [
            Sequelize.fn("sum", Sequelize.col("sim_b_dua_umum")),
            "sim_b_dua_umum",
          ],
          [Sequelize.fn("sum", Sequelize.col("sim_c")), "sim_c"],
          [Sequelize.fn("sum", Sequelize.col("sim_d")), "sim_d"],
          [
            Sequelize.fn("sum", Sequelize.col("sim_internasional")),
            "sim_internasional",
          ],
          [Sequelize.fn("sum", Sequelize.col("tanpa_sim")), "tanpa_sim"],
          [
            Sequelize.literal(
              "SUM(sim_a + sim_a_umum + sim_b + sim_b_satu_umum + sim_b_dua_umum + sim_c + sim_d + sim_internasional + tanpa_sim)"
            ),
            "total",
          ],
        ],
        include: [
          {
            model: Input_operasi_sim,
            required: false,
            as: "op_sim",
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
          sim_a: parseInt(element.dataValues.sim_a) || 0,
          sim_a_umum: parseInt(element.dataValues.sim_a_umum) || 0,
          sim_b: parseInt(element.dataValues.sim_b) || 0,
          sim_b_satu_umum: parseInt(element.dataValues.sim_b_satu_umum) || 0,
          sim_b_dua_umum: parseInt(element.dataValues.sim_b_dua_umum) || 0,
          sim_c: parseInt(element.dataValues.sim_c) || 0,
          sim_d: parseInt(element.dataValues.sim_d) || 0,
          sim_internasional:
            parseInt(element.dataValues.sim_internasional) || 0,
          tanpa_sim: parseInt(element.dataValues.tanpa_sim) || 0,
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
          [Sequelize.fn("sum", Sequelize.col("sim_a")), "sim_a"],
          [Sequelize.fn("sum", Sequelize.col("sim_a_umum")), "sim_a_umum"],
          [Sequelize.fn("sum", Sequelize.col("sim_b")), "sim_b"],
          [
            Sequelize.fn("sum", Sequelize.col("sim_b_satu_umum")),
            "sim_b_satu_umum",
          ],
          [
            Sequelize.fn("sum", Sequelize.col("sim_b_dua_umum")),
            "sim_b_dua_umum",
          ],
          [Sequelize.fn("sum", Sequelize.col("sim_c")), "sim_c"],
          [Sequelize.fn("sum", Sequelize.col("sim_d")), "sim_d"],
          [
            Sequelize.fn("sum", Sequelize.col("sim_internasional")),
            "sim_internasional",
          ],
          [Sequelize.fn("sum", Sequelize.col("tanpa_sim")), "tanpa_sim"],
          [
            Sequelize.literal(
              "SUM(sim_a + sim_a_umum + sim_b + sim_b_satu_umum + sim_b_dua_umum + sim_c + sim_d + sim_internasional + tanpa_sim)"
            ),
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

      let rows = await Input_operasi_sim.findAll(getDataRules);

      let finals = [];
      if (type === "day") {
        const asd = list_day.map((item, index) => {
          const data = rows.find((x) => x.dataValues.date == item);

          if (data) {
            finals.push({
              sim_a: parseInt(data.dataValues.sim_a),
              sim_a_umum: parseInt(data.dataValues.sim_a_umum),
              sim_b: parseInt(data.dataValues.sim_b),
              sim_b_satu_umum: parseInt(data.dataValues.sim_b_satu_umum),
              sim_b_dua_umum: parseInt(data.dataValues.sim_b_dua_umum),
              sim_c: parseInt(data.dataValues.sim_c),
              sim_d: parseInt(data.dataValues.sim_d),
              sim_internasional: parseInt(data.dataValues.sim_internasional),
              tanpa_sim: parseInt(data.dataValues.tanpa_sim),
              total: parseInt(data.dataValues.total),
              date: data.dataValues.date,
            });
          } else {
            finals.push({
              sim_a: 0,
              sim_a_umum: 0,
              sim_b: 0,
              sim_b_satu_umum: 0,
              sim_b_dua_umum: 0,
              sim_c: 0,
              sim_d: 0,
              sim_internasional: 0,
              tanpa_sim: 0,
              total: 0,
              date: item,
            });
          }
        });
      } else if (type === "month") {
        let abc = rows.map((element, index) => {
          return {
            sim_a: parseInt(element.dataValues.sim_a),
            sim_a_umum: parseInt(element.dataValues.sim_a_umum),
            sim_b: parseInt(element.dataValues.sim_b),
            sim_b_satu_umum: parseInt(element.dataValues.sim_b_satu_umum),
            sim_b_dua_umum: parseInt(element.dataValues.sim_b_dua_umum),
            sim_c: parseInt(element.dataValues.sim_c),
            sim_d: parseInt(element.dataValues.sim_d),
            sim_internasional: parseInt(element.dataValues.sim_internasional),
            tanpa_sim: parseInt(element.dataValues.tanpa_sim),
            total: parseInt(element.dataValues.total),
            date: moment(element.dataValues.month).format("MMMM"),
          };
        });

        const asd = list_month.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              sim_a: parseInt(data.sim_a),
              sim_a_umum: parseInt(data.sim_a_umum),
              sim_b: parseInt(data.sim_b),
              sim_b_satu_umum: parseInt(data.sim_b_satu_umum),
              sim_b_dua_umum: parseInt(data.sim_b_dua_umum),
              sim_c: parseInt(data.sim_c),
              sim_d: parseInt(data.sim_d),
              sim_internasional: parseInt(data.sim_internasional),
              tanpa_sim: parseInt(data.tanpa_sim),
              total: parseInt(data.total),
              date: data.date,
            });
          } else {
            finals.push({
              sim_a: 0,
              sim_a_umum: 0,
              sim_b: 0,
              sim_b_satu_umum: 0,
              sim_b_dua_umum: 0,
              sim_c: 0,
              sim_d: 0,
              sim_internasional: 0,
              tanpa_sim: 0,
              total: 0,
              date: item,
            });
          }
        });
      } else if (type === "year") {
        let abc = rows.map((element, index) => {
          return {
            sim_a: parseInt(element.dataValues.sim_a),
            sim_a_umum: parseInt(element.dataValues.sim_a_umum),
            sim_b: parseInt(element.dataValues.sim_b),
            sim_b_satu_umum: parseInt(element.dataValues.sim_b_satu_umum),
            sim_b_dua_umum: parseInt(element.dataValues.sim_b_dua_umum),
            sim_c: parseInt(element.dataValues.sim_c),
            sim_d: parseInt(element.dataValues.sim_d),
            sim_internasional: parseInt(element.dataValues.sim_internasional),
            tanpa_sim: parseInt(element.dataValues.tanpa_sim),
            total: parseInt(element.dataValues.total),
            date: moment(element.dataValues.year).format("YYYY"),
          };
        });

        const asd = list_year.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              sim_a: parseInt(data.sim_a),
              sim_a_umum: parseInt(data.sim_a_umum),
              sim_b: parseInt(data.sim_b),
              sim_b_satu_umum: parseInt(data.sim_b_satu_umum),
              sim_b_dua_umum: parseInt(data.sim_b_dua_umum),
              sim_c: parseInt(data.sim_c),
              sim_d: parseInt(data.sim_d),
              sim_internasional: parseInt(data.sim_internasional),
              tanpa_sim: parseInt(data.tanpa_sim),
              total: parseInt(data.total),
              date: data.date,
            });
          } else {
            finals.push({
              sim_a: 0,
              sim_a_umum: 0,
              sim_b: 0,
              sim_b_satu_umum: 0,
              sim_b_dua_umum: 0,
              sim_c: 0,
              sim_d: 0,
              sim_internasional: 0,
              tanpa_sim: 0,
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
  //           sim_a: item.sim_a,
  //           sim_a_umum: item.sim_a_umum,
  //           sim_b: item.sim_b,
  //           sim_b_satu_umum: item.sim_b_satu_umum,
  //           sim_b_dua_umum: item.sim_b_dua_umum,
  //           sim_c: item.sim_c,
  //           sim_d: item.sim_d,
  //           sim_internasional: item.sim_internasional,
  //           tanpa_sim: item.tanpa_sim,
  //         });
  //       });
  //       let insertDataPolda = await Input_operasi_sim.bulkCreate(
  //         dataInputPolda,
  //         { transaction: transaction }
  //       );
  //     } else {
  //       let checkData = await Input_operasi_sim.findOne({
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
  //         sim_a: req.body.sim_a,
  //         sim_a_umum: req.body.sim_a_umum,
  //         sim_b: req.body.sim_b,
  //         sim_b_satu_umum: req.body.sim_b_satu_umum,
  //         sim_b_dua_umum: req.body.sim_b_dua_umum,
  //         sim_c: req.body.sim_c,
  //         sim_d: req.body.sim_d,
  //         sim_internasional: req.body.sim_internasional,
  //         tanpa_sim: req.body.tanpa_sim,
  //       };
  //       if (checkData) {
  //         let updateData = await Input_operasi_sim.update(inputData, {
  //           where: {
  //             polda_id: decAes(req.body.polda_id),
  //             polres_id: decAes(req.body.polres_id),
  //             date: req.body.date,
  //             operasi_id: decAes(req.body.operasi_id),
  //           },
  //           transaction: transaction,
  //         });
  //       } else {
  //         let insertData = await Input_operasi_sim.create(inputData, {
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
          sim_a: item.sim_a,
          sim_a_umum: item.sim_a_umum,
          sim_b: item.sim_b,
          sim_b_satu_umum: item.sim_b_satu_umum,
          sim_b_dua_umum: item.sim_b_dua_umum,
          sim_c: item.sim_c,
          sim_d: item.sim_d,
          sim_internasional: item.sim_internasional,
          tanpa_sim: item.tanpa_sim,
        });
      });
      await transaction.commit();
      response(res, true, "Succeed", null);
    } catch (error) {
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };
};
