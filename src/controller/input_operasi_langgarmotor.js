const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const Input_operasi_langgarmotor = require("../model/operasi_lg_langgar_motor");
const Operasi = require("../model/operation_profile");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");

const Polda = require("../model/polda");

Polda.hasMany(Input_operasi_langgarmotor, {
  foreignKey: "polda_id",
  as: "op_langgarmotor",
});

const decAes = (token) =>
  AESDecrypt(token, {
    isSafeUrl: true,
    parseMode: "string",
  });

module.exports = class OperasiLanggarMotorController {
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
          [Sequelize.fn("sum", Sequelize.col("lawan_arus")), "lawan_arus"],
          [Sequelize.fn("sum", Sequelize.col("bermain_hp")), "bermain_hp"],
          [
            Sequelize.fn("sum", Sequelize.col("pengaruh_alkohol")),
            "pengaruh_alkohol",
          ],
          [
            Sequelize.fn("sum", Sequelize.col("max_kecepatan")),
            "max_kecepatan",
          ],
          [Sequelize.fn("sum", Sequelize.col("dibawah_umur")), "dibawah_umur"],
          [Sequelize.fn("sum", Sequelize.col("tanpa_helm")), "tanpa_helm"],
          [Sequelize.fn("sum", Sequelize.col("lain_lain")), "lain_lain"],
          [
            Sequelize.literal(
              "SUM(lawan_arus + bermain_hp + pengaruh_alkohol + max_kecepatan + dibawah_umur + tanpa_helm + lain_lain)"
            ),
            "total",
          ],
        ],
        include: [
          {
            model: Input_operasi_langgarmotor,
            required: false,
            as: "op_langgarmotor",
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
          lawan_arus: parseInt(element.dataValues.lawan_arus) || 0,
          bermain_hp: parseInt(element.dataValues.bermain_hp) || 0,
          pengaruh_alkohol: parseInt(element.dataValues.pengaruh_alkohol) || 0,
          max_kecepatan: parseInt(element.dataValues.max_kecepatan) || 0,
          dibawah_umur: parseInt(element.dataValues.dibawah_umur) || 0,
          tanpa_helm: parseInt(element.dataValues.tanpa_helm) || 0,
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
          [Sequelize.fn("sum", Sequelize.col("lawan_arus")), "lawan_arus"],
          [Sequelize.fn("sum", Sequelize.col("bermain_hp")), "bermain_hp"],
          [
            Sequelize.fn("sum", Sequelize.col("pengaruh_alkohol")),
            "pengaruh_alkohol",
          ],
          [
            Sequelize.fn("sum", Sequelize.col("max_kecepatan")),
            "max_kecepatan",
          ],
          [Sequelize.fn("sum", Sequelize.col("dibawah_umur")), "dibawah_umur"],
          [Sequelize.fn("sum", Sequelize.col("tanpa_helm")), "tanpa_helm"],
          [Sequelize.fn("sum", Sequelize.col("lain_lain")), "lain_lain"],
          [
            Sequelize.literal(
              "SUM(lawan_arus + bermain_hp + pengaruh_alkohol + max_kecepatan + dibawah_umur + tanpa_helm + lain_lain)"
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

      let rows = await Input_operasi_langgarmotor.findAll(getDataRules);

      let finals = [];
      if (type === "day") {
        const asd = list_day.map((item, index) => {
          const data = rows.find((x) => x.dataValues.date == item);
          console.log(data);
          if (data) {
            finals.push({
              lawan_arus: parseInt(data.dataValues.lawan_arus),
              bermain_hp: parseInt(data.dataValues.bermain_hp),
              pengaruh_alkohol: parseInt(data.dataValues.pengaruh_alkohol),
              max_kecepatan: parseInt(data.dataValues.max_kecepatan),
              dibawah_umur: parseInt(data.dataValues.dibawah_umur),
              tanpa_helm: parseInt(data.dataValues.tanpa_helm),
              lain_lain: parseInt(data.dataValues.lain_lain),
              total: parseInt(data.dataValues.total),
              date: data.dataValues.date,
            });
          } else {
            finals.push({
              lawan_arus: 0,
              bermain_hp: 0,
              pengaruh_alkohol: 0,
              max_kecepatan: 0,
              dibawah_umur: 0,
              tanpa_helm: 0,
              lain_lain: 0,
              total: 0,
              date: item,
            });
          }
        });
      } else if (type === "month") {
        let abc = rows.map((element, index) => {
          return {
            lawan_arus: parseInt(element.dataValues.lawan_arus),
            bermain_hp: parseInt(element.dataValues.bermain_hp),
            pengaruh_alkohol: parseInt(element.dataValues.pengaruh_alkohol),
            max_kecepatan: parseInt(element.dataValues.max_kecepatan),
            dibawah_umur: parseInt(element.dataValues.dibawah_umur),
            tanpa_helm: parseInt(element.dataValues.tanpa_helm),
            lain_lain: parseInt(element.dataValues.lain_lain),
            total: parseInt(element.dataValues.total),
            date: moment(element.dataValues.month).format("MMMM"),
          };
        });

        const asd = list_month.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              lawan_arus: parseInt(data.lawan_arus),
              bermain_hp: parseInt(data.bermain_hp),
              pengaruh_alkohol: parseInt(data.pengaruh_alkohol),
              max_kecepatan: parseInt(data.max_kecepatan),
              dibawah_umur: parseInt(data.dibawah_umur),
              tanpa_helm: parseInt(data.tanpa_helm),
              lain_lain: parseInt(data.lain_lain),
              total: parseInt(data.total),
              date: data.date,
            });
          } else {
            finals.push({
              lawan_arus: 0,
              bermain_hp: 0,
              pengaruh_alkohol: 0,
              max_kecepatan: 0,
              dibawah_umur: 0,
              tanpa_helm: 0,
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
  //           lawan_arus: item.lawan_arus,
  //           bermain_hp: item.bermain_hp,
  //           pengaruh_alkohol: item.pengaruh_alkohol,
  //           max_kecepatan: item.max_kecepatan,
  //           dibawah_umur: item.dibawah_umur,
  //           tanpa_helm: item.tanpa_helm,
  //           lain_lain: item.lain_lain,
  //         });
  //       });
  //       let insertDataPolda = await Input_operasi_langgarmotor.bulkCreate(
  //         dataInputPolda,
  //         { transaction: transaction }
  //       );
  //     } else {
  //       let checkData = await Input_operasi_langgarmotor.findOne({
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
  //         lawan_arus: req.body.lawan_arus,
  //         bermain_hp: req.body.bermain_hp,
  //         pengaruh_alkohol: req.body.pengaruh_alkohol,
  //         max_kecepatan: req.body.max_kecepatan,
  //         dibawah_umur: req.body.dibawah_umur,
  //         tanpa_helm: req.body.tanpa_helm,
  //         lain_lain: req.body.lain_lain,
  //       };
  //       if (checkData) {
  //         let updateData = await Input_operasi_langgarmotor.update(inputData, {
  //           where: {
  //             polda_id: decAes(req.body.polda_id),
  //             polres_id: decAes(req.body.polres_id),
  //             date: req.body.date,
  //             operasi_id: decAes(req.body.operasi_id),
  //           },
  //           transaction: transaction,
  //         });
  //       } else {
  //         let insertData = await Input_operasi_langgarmotor.create(inputData, {
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
          lawan_arus: item.lawan_arus,
          bermain_hp: item.bermain_hp,
          pengaruh_alkohol: item.pengaruh_alkohol,
          max_kecepatan: item.max_kecepatan,
          dibawah_umur: item.dibawah_umur,
          tanpa_helm: item.tanpa_helm,
          lain_lain: item.lain_lain,
        });
      });
      let insertDataPolda = await Input_operasi_langgarmotor.bulkCreate(
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
