const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const Input_operasi_lokasi_kawasan = require("../model/operasi_lg_lokasi_kawasan");
const Operasi = require("../model/operation_profile");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");

const Polda = require("../model/polda");

Polda.hasMany(Input_operasi_lokasi_kawasan, {
  foreignKey: "polda_id",
  as: "op_lokasi_kawasan",
});

const decAes = (token) =>
  AESDecrypt(token, {
    isSafeUrl: true,
    parseMode: "string",
  });
module.exports = class OperasiLokasiKawasanController {
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
          [Sequelize.fn("sum", Sequelize.col("pemukiman")), "pemukiman"],
          [Sequelize.fn("sum", Sequelize.col("perbelanjaan")), "perbelanjaan"],
          [Sequelize.fn("sum", Sequelize.col("industri")), "industri"],
          [Sequelize.fn("sum", Sequelize.col("wisata")), "wisata"],
          [Sequelize.fn("sum", Sequelize.col("perkantoran")), "perkantoran"],
          [
            Sequelize.literal(
              "SUM(pemukiman + perbelanjaan + industri + wisata + perkantoran)"
            ),
            "total",
          ],
        ],
        include: [
          {
            model: Input_operasi_lokasi_kawasan,
            required: false,
            as: "op_lokasi_kawasan",
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
          pemukiman: parseInt(element.dataValues.pemukiman) || 0,
          perbelanjaan: parseInt(element.dataValues.perbelanjaan) || 0,
          industri: parseInt(element.dataValues.industri) || 0,
          wisata: parseInt(element.dataValues.wisata) || 0,
          perkantoran: parseInt(element.dataValues.perkantoran) || 0,
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
          [Sequelize.fn("sum", Sequelize.col("pemukiman")), "pemukiman"],
          [Sequelize.fn("sum", Sequelize.col("perbelanjaan")), "perbelanjaan"],
          [Sequelize.fn("sum", Sequelize.col("industri")), "industri"],
          [Sequelize.fn("sum", Sequelize.col("wisata")), "wisata"],
          [Sequelize.fn("sum", Sequelize.col("perkantoran")), "perkantoran"],
          [
            Sequelize.literal(
              "SUM(pemukiman + perbelanjaan + industri + wisata + perkantoran)"
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

      let rows = await Input_operasi_lokasi_kawasan.findAll(getDataRules);

      let finals = [];
      if (type === "day") {
        const asd = list_day.map((item, index) => {
          const data = rows.find((x) => x.dataValues.date == item);
          console.log(data);
          if (data) {
            finals.push({
              pemukiman: parseInt(data.dataValues.pemukiman),
              perbelanjaan: parseInt(data.dataValues.perbelanjaan),
              industri: parseInt(data.dataValues.industri),
              wisata: parseInt(data.dataValues.wisata),
              perkantoran: parseInt(data.dataValues.perkantoran),
              total: parseInt(data.dataValues.total),
              date: data.dataValues.date,
            });
          } else {
            finals.push({
              pemukiman: 0,
              perbelanjaan: 0,
              industri: 0,
              wisata: 0,
              perkantoran: 0,
              total: 0,
              date: item,
            });
          }
        });
      } else if (type === "month") {
        let abc = rows.map((element, index) => {
          return {
            pemukiman: parseInt(element.dataValues.pemukiman),
            perbelanjaan: parseInt(element.dataValues.perbelanjaan),
            industri: parseInt(element.dataValues.industri),
            wisata: parseInt(element.dataValues.wisata),
            perkantoran: parseInt(element.dataValues.perkantoran),
            total: parseInt(element.dataValues.total),
            date: moment(element.dataValues.month).format("MMMM"),
          };
        });

        const asd = list_month.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              pemukiman: parseInt(data.pemukiman),
              perbelanjaan: parseInt(data.perbelanjaan),
              industri: parseInt(data.industri),
              wisata: parseInt(data.wisata),
              perkantoran: parseInt(data.perkantoran),
              total: parseInt(data.total),
              date: data.date,
            });
          } else {
            finals.push({
              pemukiman: 0,
              perbelanjaan: 0,
              industri: 0,
              wisata: 0,
              perkantoran: 0,
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
  //           pemukiman: item.pemukiman,
  //           perbelanjaan: item.perbelanjaan,
  //           industri: item.industri,
  //           wisata: item.wisata,
  //           perkantoran: item.perkantoran,
  //         });
  //       });
  //       let insertDataPolda = await Input_operasi_lokasi_kawasan.bulkCreate(
  //         dataInputPolda,
  //         { transaction: transaction }
  //       );
  //     } else {
  //       let checkData = await Input_operasi_lokasi_kawasan.findOne({
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
  //         pemukiman: req.body.pemukiman,
  //         perbelanjaan: req.body.perbelanjaan,
  //         industri: req.body.industri,
  //         wisata: req.body.wisata,
  //         perkantoran: req.body.perkantoran,
  //       };
  //       if (checkData) {
  //         let updateData = await Input_operasi_lokasi_kawasan.update(
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
  //         let insertData = await Input_operasi_lokasi_kawasan.create(
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
    try {
      const transaction = await db.transaction();
      let dataInputPolda = [];
      req.body?.value.map((item) => {
        dataInputPolda.push({
          polda_id: decAes(item.polda_id),
          date: item.date,
          operasi_id: decAes(item.operasi_id),
          pemukiman: item.pemukiman,
          perbelanjaan: item.perbelanjaan,
          industri: item.industri,
          wisata: item.wisata,
          perkantoran: item.perkantoran,
        });
      });
      let insertDataPolda = await Input_operasi_lokasi_kawasan.bulkCreate(
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
