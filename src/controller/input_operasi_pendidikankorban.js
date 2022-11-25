const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const Input_operasi_pendidikankorban = require("../model/operasi_lk_pendidikan_korban");
const Operasi = require("../model/operation_profile");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");

const Polda = require("../model/polda");

Polda.hasMany(Input_operasi_pendidikankorban, {
  foreignKey: "polda_id",
  as: "op_pendidikan_korban",
});

const decAes = (token) =>
  AESDecrypt(token, {
    isSafeUrl: true,
    parseMode: "string",
  });
module.exports = class OperasiPendidikanKorbanController {
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
          [Sequelize.fn("sum", Sequelize.col("sd")), "sd"],
          [Sequelize.fn("sum", Sequelize.col("sltp")), "sltp"],
          [Sequelize.fn("sum", Sequelize.col("slta")), "slta"],
          [Sequelize.fn("sum", Sequelize.col("d3")), "d3"],
          [Sequelize.fn("sum", Sequelize.col("s1")), "s1"],
          [Sequelize.fn("sum", Sequelize.col("s2")), "s2"],
          [
            Sequelize.fn("sum", Sequelize.col("tidak_diketahui")),
            "tidak_diketahui",
          ],
          [
            Sequelize.literal(
              "SUM(sd + sltp + slta + d3 + s1 + s2 + tidak_diketahui)"
            ),
            "total",
          ],
        ],
        include: [
          {
            model: Input_operasi_pendidikankorban,
            required: false,
            as: "op_pendidikan_korban",
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
          sd: parseInt(element.dataValues.sd) || 0,
          sltp: parseInt(element.dataValues.sltp) || 0,
          slta: parseInt(element.dataValues.slta) || 0,
          d3: parseInt(element.dataValues.d3) || 0,
          s1: parseInt(element.dataValues.s1) || 0,
          s2: parseInt(element.dataValues.s2) || 0,
          tidak_diketahui: parseInt(element.dataValues.tidak_diketahui) || 0,
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
          [Sequelize.fn("sum", Sequelize.col("sd")), "sd"],
          [Sequelize.fn("sum", Sequelize.col("sltp")), "sltp"],
          [Sequelize.fn("sum", Sequelize.col("slta")), "slta"],
          [Sequelize.fn("sum", Sequelize.col("d3")), "d3"],
          [Sequelize.fn("sum", Sequelize.col("s1")), "s1"],
          [Sequelize.fn("sum", Sequelize.col("s2")), "s2"],
          [
            Sequelize.fn("sum", Sequelize.col("tidak_diketahui")),
            "tidak_diketahui",
          ],
          [
            Sequelize.literal(
              "SUM(sd + sltp + slta + d3 + s1 + s2 + tidak_diketahui)"
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

      let rows = await Input_operasi_pendidikankorban.findAll(getDataRules);

      let finals = [];
      if (type === "day") {
        const asd = list_day.map((item, index) => {
          const data = rows.find((x) => x.dataValues.date == item);
          console.log(data);
          if (data) {
            finals.push({
              sd: parseInt(data.dataValues.sd),
              sltp: parseInt(data.dataValues.sltp),
              slta: parseInt(data.dataValues.slta),
              d3: parseInt(data.dataValues.d3),
              s1: parseInt(data.dataValues.s1),
              s2: parseInt(data.dataValues.s2),
              tidak_diketahui: parseInt(data.dataValues.tidak_diketahui),
              total: parseInt(data.dataValues.total),
              date: data.dataValues.date,
            });
          } else {
            finals.push({
              sd: 0,
              sltp: 0,
              slta: 0,
              d3: 0,
              s1: 0,
              s2: 0,
              tidak_diketahui: 0,
              total: 0,
              date: item,
            });
          }
        });
      } else if (type === "month") {
        let abc = rows.map((element, index) => {
          return {
            sd: parseInt(element.dataValues.sd),
            sltp: parseInt(element.dataValues.sltp),
            slta: parseInt(element.dataValues.slta),
            d3: parseInt(element.dataValues.d3),
            s1: parseInt(element.dataValues.s1),
            s2: parseInt(element.dataValues.s2),
            tidak_diketahui: parseInt(element.dataValues.tidak_diketahui),
            total: parseInt(element.dataValues.total),
            date: moment(element.dataValues.month).format("MMMM"),
          };
        });

        const asd = list_month.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              sd: parseInt(data.sd),
              sltp: parseInt(data.sltp),
              slta: parseInt(data.slta),
              d3: parseInt(data.d3),
              s1: parseInt(data.s1),
              s2: parseInt(data.s2),
              tidak_diketahui: parseInt(data.tidak_diketahui),
              total: parseInt(data.total),
              date: data.date,
            });
          } else {
            finals.push({
              sd: 0,
              sltp: 0,
              slta: 0,
              d3: 0,
              s1: 0,
              s2: 0,
              tidak_diketahui: 0,
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
  //           sd: item.sd,
  //           sltp: item.sltp,
  //           slta: item.slta,
  //           d3: item.d3,
  //           s1: item.s1,
  //           s2: item.s2,
  //           tidak_diketahui: item.tidak_diketahui,
  //         });
  //       });
  //       let insertDataPolda = await Input_operasi_pendidikankorban.bulkCreate(
  //         dataInputPolda,
  //         { transaction: transaction }
  //       );
  //     } else {
  //       let checkData = await Input_operasi_pendidikankorban.findOne({
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
  //         sd: req.body.sd,
  //         sltp: req.body.sltp,
  //         slta: req.body.slta,
  //         d3: req.body.d3,
  //         s1: req.body.s1,
  //         s2: req.body.s2,
  //         tidak_diketahui: req.body.tidak_diketahui,
  //       };
  //       if (checkData) {
  //         let updateData = await Input_operasi_pendidikankorban.update(
  //           inputData,
  //           {
  //             where: {
  //               polda_id: decAes(req.body.polda_id),
  //               polres_id: decAes(req.body.polres_id),
  //               date: req.body.date,
  //               operasi_id: decAes(req.body.operasi_id),
  //             },
  //             transaction: transaction,
  //           }
  //         );
  //       } else {
  //         let insertData = await Input_operasi_pendidikankorban.create(
  //           inputData,
  //           {
  //             transaction: transaction,
  //           }
  //         );
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
          sd: item.sd,
          sltp: item.sltp,
          slta: item.slta,
          d3: item.d3,
          s1: item.s1,
          s2: item.s2,
          tidak_diketahui: item.tidak_diketahui,
        });
      });
      let insertDataPolda = await Input_operasi_pendidikankorban.bulkCreate(
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
