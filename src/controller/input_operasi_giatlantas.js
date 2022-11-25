const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const Input_operasi_giatlantas = require("../model/operasi_lg_giatlantas");
const Operasi = require("../model/operation_profile");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const Polda = require("../model/polda");
const fs = require("fs");

Polda.hasMany(Input_operasi_giatlantas, {
  foreignKey: "polda_id",
  as: "op_giatlantas",
});

const decAes = (token) =>
  AESDecrypt(token, {
    isSafeUrl: true,
    parseMode: "string",
  });
module.exports = class OperasiGiatlantasController {
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
          [Sequelize.fn("sum", Sequelize.col("pengaturan")), "pengaturan"],
          [Sequelize.fn("sum", Sequelize.col("penjagaan")), "penjagaan"],
          [Sequelize.fn("sum", Sequelize.col("pengawalan")), "pengawalan"],
          [Sequelize.fn("sum", Sequelize.col("patroli")), "patroli"],
          [
            Sequelize.literal(
              "SUM(pengaturan + penjagaan + pengawalan + patroli)"
            ),
            "total",
          ],
        ],
        include: [
          {
            model: Input_operasi_giatlantas,
            required: false,
            as: "op_giatlantas",
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
          pengaturan: parseInt(element.dataValues.pengaturan) || 0,
          penjagaan: parseInt(element.dataValues.penjagaan) || 0,
          pengawalan: parseInt(element.dataValues.pengawalan) || 0,
          patroli: parseInt(element.dataValues.patroli) || 0,
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
          [Sequelize.fn("sum", Sequelize.col("pengaturan")), "pengaturan"],
          [Sequelize.fn("sum", Sequelize.col("penjagaan")), "penjagaan"],
          [Sequelize.fn("sum", Sequelize.col("pengawalan")), "pengawalan"],
          [Sequelize.fn("sum", Sequelize.col("patroli")), "patroli"],
          [
            Sequelize.literal(
              "SUM(pengaturan + penjagaan + pengawalan + patroli)"
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

      let rows = await Input_operasi_giatlantas.findAll(getDataRules);

      let finals = [];
      if (type === "day") {
        const asd = list_day.map((item, index) => {
          const data = rows.find((x) => x.dataValues.date == item);
          console.log(data);
          if (data) {
            finals.push({
              pengaturan: parseInt(data.dataValues.pengaturan),
              penjagaan: parseInt(data.dataValues.penjagaan),
              pengawalan: parseInt(data.dataValues.pengawalan),
              patroli: parseInt(data.dataValues.patroli),
              total: parseInt(data.dataValues.total),
              date: data.dataValues.date,
            });
          } else {
            finals.push({
              pengaturan: 0,
              penjagaan: 0,
              pengawalan: 0,
              patroli: 0,
              total: 0,
              date: item,
            });
          }
        });
      } else if (type === "month") {
        let abc = rows.map((element, index) => {
          return {
            pengaturan: parseInt(element.dataValues.pengaturan),
            penjagaan: parseInt(element.dataValues.penjagaan),
            pengawalan: parseInt(element.dataValues.pengawalan),
            patroli: parseInt(element.dataValues.patroli),
            total: parseInt(element.dataValues.total),
            date: moment(element.dataValues.month).format("MMMM"),
          };
        });

        const asd = list_month.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              pengaturan: parseInt(data.pengaturan),
              penjagaan: parseInt(data.penjagaan),
              pengawalan: parseInt(data.pengawalan),
              patroli: parseInt(data.patroli),
              total: parseInt(data.total),
              date: data.date,
            });
          } else {
            finals.push({
              pengaturan: 0,
              penjagaan: 0,
              pengawalan: 0,
              patroli: 0,
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

  static mobile_giatlantas = async (req, res) => {
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

      const modelAttr = Object.keys(Input_operasi_giatlantas.getAttributes());
      let getDataRules = {
        group: ["polda.id"],
        include: [
          {
            model: Input_operasi_giatlantas,
            required: false,
            as: "op_giatlantas",
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
          } else if (filter === "jumlah_turjagwali") {
            whereBuilder.push([
              Sequelize.literal(
                "SUM(pengaturan + pengawalan + penjagaan + patroli)"
              ),
              "value",
            ]);
          }
        });
      } else {
        modelAttr.forEach((key) => {
          if (
            key == "pengaturan" ||
            key == "pengawalan" ||
            key == "penjagaan" ||
            key == "patroli"
          ) {
            whereBuilder.push(
              [Sequelize.fn("sum", Sequelize.col(`${key}`)), key],
              [
                Sequelize.literal(
                  "SUM(pengaturan + penjagaan + pengawalan + patroli)"
                ),
                "jumlah_turjagwali",
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
  //           pengaturan: item.pengaturan,
  //           penjagaan: item.penjagaan,
  //           pengawalan: item.pengawalan,
  //           patroli: item.patroli,
  //         });
  //       });
  //       let insertDataPolda = await Input_operasi_giatlantas.bulkCreate(
  //         dataInputPolda,
  //         { transaction: transaction }
  //       );
  //     } else {
  //       let checkData = await Input_operasi_giatlantas.findOne({
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
  //         pengaturan: req.body.pengaturan,
  //         penjagaan: req.body.penjagaan,
  //         pengawalan: req.body.pengawalan,
  //         patroli: req.body.patroli,
  //       };
  //       if (checkData) {
  //         let updateData = await Input_operasi_giatlantas.update(inputData, {
  //           where: {
  //             polda_id: decAes(req.body.polda_id),
  //             polres_id: decAes(req.body.polres_id),
  //             date: req.body.date,
  //             operasi_id: decAes(req.body.operasi_id),
  //           },
  //           transaction: transaction,
  //         });
  //       } else {
  //         let insertData = await Input_operasi_giatlantas.create(inputData, {
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
          pengaturan: item.pengaturan,
          penjagaan: item.penjagaan,
          pengawalan: item.pengawalan,
          patroli: item.patroli,
        });
      });
      let insertDataPolda = await Input_operasi_giatlantas.bulkCreate(
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
