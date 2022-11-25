const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const Input_operasi_langgarlantas = require("../model/operasi_lg_langgarlantas");
const Operasi = require("../model/operation_profile");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const Polda = require("../model/polda");
const fs = require("fs");

Polda.hasMany(Input_operasi_langgarlantas, {
  foreignKey: "polda_id",
  as: "op_langgarlantas",
});

const decAes = (token) =>
  AESDecrypt(token, {
    isSafeUrl: true,
    parseMode: "string",
  });

module.exports = class OperasiLanggarLantasController {
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
          [
            Sequelize.fn("sum", Sequelize.col("pelanggaran_berat")),
            "pelanggaran_berat",
          ],
          [
            Sequelize.fn("sum", Sequelize.col("pelanggaran_sedang")),
            "pelanggaran_sedang",
          ],
          [
            Sequelize.fn("sum", Sequelize.col("pelanggaran_ringan")),
            "pelanggaran_ringan",
          ],
          [Sequelize.fn("sum", Sequelize.col("statis")), "statis"],
          [Sequelize.fn("sum", Sequelize.col("mobile")), "mobile"],
          [Sequelize.fn("sum", Sequelize.col("teguran")), "teguran"],
          [
            Sequelize.literal(
              "SUM(pelanggaran_berat + pelanggaran_sedang + pelanggaran_ringan + statis + mobile + teguran)"
            ),
            "total",
          ],
        ],
        include: [
          {
            model: Input_operasi_langgarlantas,
            required: false,
            as: "op_lakalanggar",
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
          pelanggaran_berat:
            parseInt(element.dataValues.pelanggaran_berat) || 0,
          pelanggaran_sedang:
            parseInt(element.dataValues.pelanggaran_sedang) || 0,
          pelanggaran_ringan:
            parseInt(element.dataValues.pelanggaran_ringan) || 0,
          statis: parseInt(element.dataValues.statis) || 0,
          mobile: parseInt(element.dataValues.mobile) || 0,
          statis: parseInt(element.dataValues.statis) || 0,
          teguran: parseInt(element.dataValues.teguran) || 0,
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
          [
            Sequelize.fn("sum", Sequelize.col("pelanggaran_berat")),
            "pelanggaran_berat",
          ],
          [
            Sequelize.fn("sum", Sequelize.col("pelanggaran_sedang")),
            "pelanggaran_sedang",
          ],
          [
            Sequelize.fn("sum", Sequelize.col("pelanggaran_ringan")),
            "pelanggaran_ringan",
          ],
          [Sequelize.fn("sum", Sequelize.col("statis")), "statis"],
          [Sequelize.fn("sum", Sequelize.col("mobile")), "mobile"],
          [Sequelize.fn("sum", Sequelize.col("teguran")), "teguran"],
          [
            Sequelize.literal(
              "SUM(pelanggaran_berat + pelanggaran_sedang + pelanggaran_ringan + statis + mobile + teguran)"
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

      let rows = await Input_operasi_langgarlantas.findAll(getDataRules);

      let finals = [];
      if (type === "day") {
        const asd = list_day.map((item, index) => {
          const data = rows.find((x) => x.dataValues.date == item);
          console.log(data);
          if (data) {
            finals.push({
              pelanggaran_berat: parseInt(data.dataValues.pelanggaran_berat),
              pelanggaran_sedang: parseInt(data.dataValues.pelanggaran_sedang),
              pelanggaran_ringan: parseInt(data.dataValues.pelanggaran_ringan),
              statis: parseInt(data.dataValues.statis),
              mobile: parseInt(data.dataValues.mobile),
              teguran: parseInt(data.dataValues.teguran),
              total: parseInt(data.dataValues.total),
              date: data.dataValues.date,
            });
          } else {
            finals.push({
              pelanggaran_berat: 0,
              pelanggaran_sedang: 0,
              pelanggaran_ringan: 0,
              statis: 0,
              mobile: 0,
              teguran: 0,
              total: 0,
              date: item,
            });
          }
        });
      } else if (type === "month") {
        let abc = rows.map((element, index) => {
          return {
            pelanggaran_berat: parseInt(element.dataValues.pelanggaran_berat),
            pelanggaran_sedang: parseInt(element.dataValues.pelanggaran_sedang),
            pelanggaran_ringan: parseInt(element.dataValues.pelanggaran_ringan),
            statis: parseInt(element.dataValues.statis),
            mobile: parseInt(element.dataValues.mobile),
            teguran: parseInt(element.dataValues.teguran),
            total: parseInt(element.dataValues.total),
            date: moment(element.dataValues.month).format("MMMM"),
          };
        });

        const asd = list_month.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              pelanggaran_berat: parseInt(data.pelanggaran_berat),
              pelanggaran_sedang: parseInt(data.pelanggaran_sedang),
              pelanggaran_ringan: parseInt(data.pelanggaran_ringan),
              statis: parseInt(data.statis),
              mobile: parseInt(data.mobile),
              teguran: parseInt(data.teguran),
              total: parseInt(data.total),
              date: data.date,
            });
          } else {
            finals.push({
              pelanggaran_berat: 0,
              pelanggaran_sedang: 0,
              pelanggaran_ringan: 0,
              statis: 0,
              mobile: 0,
              teguran: 0,
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

  static mobile_langgarlantas = async (req, res) => {
    try {
      const {
        start_date = null,
        end_date = null,
        filter = null,
        filter_by = null,
        date = null,
        serverSide = null,
        length = null,
        start = null,
        polda_id = null,
        topPolda = null,
        operasi_id = null,
      } = req.query;

      const modelAttr = Object.keys(
        Input_operasi_langgarlantas.getAttributes()
      );
      let getDataRules = {
        group: ["polda.id"],
        include: [
          {
            model: Input_operasi_langgarlantas,
            required: false,
            as: "operasi-langgarlantas",
            attributes: [],
            where: {
              [Op.and]: [{ date: date }, { operasi_id: decAes(operasi_id) }],
            },
          },
        ],
        raw: true,
        nest: true,
        subQuery: false,
      };
      let whereBuilder = ["id", ["name_polda", "label"]];
      if (filter != null) {
        modelAttr.forEach((key) => {
          if (filter === key) {
            whereBuilder.push([
              Sequelize.fn("sum", Sequelize.col(`${key}`)),
              "value",
            ]);
          } else if (filter === "jumlah_pelanggaran") {
            whereBuilder.push([
              Sequelize.literal(
                "SUM(pelanggaran_berat + pelanggaran_sedang + pelanggaran_ringan + teguran + statis + mobile)"
              ),
              "value",
            ]);
          }
        });
      } else {
        modelAttr.forEach((key) => {
          if (
            key == "pelanggaran_berat" ||
            key == "pelanggaran_sedang" ||
            key == "pelanggaran_ringan" ||
            key == "teguran" ||
            key == "statis" ||
            key == "mobile"
          ) {
            whereBuilder.push(
              [Sequelize.fn("sum", Sequelize.col(`${key}`)), key],
              [
                Sequelize.literal(
                  "SUM(pelanggaran_berat + pelanggaran_ringan + pelanggaran_sedang + teguran + statis + mobile)"
                ),
                "jumlah_pelanggaran",
              ]
            );
          }
        });
      }

      getDataRules.attributes = whereBuilder;
      let finals = await Polda.findAll(getDataRules);
      let rows = finals.map((element, index) => {
        if (element.value == null) {
          element.value = 0;
        } else {
          element.value = parseInt(element.value);
        }
        return element;
      });
      rows.sort((a, b) => b.value - a.value);
      rows = rows.slice(0, 10);
      response(res, true, "Succeed", rows);
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
  //           statis: item.statis,
  //           mobile: item.mobile,
  //           teguran: item.teguran,
  //         });
  //       });
  //       let insertDataPolda = await Input_operasi_langgarlantas.bulkCreate(
  //         dataInputPolda,
  //         { transaction: transaction }
  //       );
  //     } else {
  //       let checkData = await Input_operasi_langgarlantas.findOne({
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
  //         statis: req.body.statis,
  //         mobile: req.body.mobile,
  //         teguran: req.body.teguran,
  //       };
  //       if (checkData) {
  //         let updateData = await Input_operasi_langgarlantas.update(inputData, {
  //           where: {
  //             polda_id: decAes(req.body.polda_id),
  //             polres_id: decAes(req.body.polres_id),
  //             date: req.body.date,
  //             operasi_id: decAes(req.body.operasi_id),
  //           },
  //           transaction: transaction,
  //         });
  //       } else {
  //         let insertData = await Input_operasi_langgarlantas.create(inputData, {
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
          pelanggaran_berat: item.pelanggaran_berat,
          pelanggaran_sedang: item.pelanggaran_sedang,
          pelanggaran_ringan: item.pelanggaran_ringan,
          statis: item.statis,
          mobile: item.mobile,
          teguran: item.teguran,
        });
      });
      let insertDataPolda = await Input_operasi_langgarlantas.bulkCreate(
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
