const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const Input_operasi_bukti = require("../model/operasi_lg_bukti");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");
const pagination = require("../lib/pagination-parser");

const Polda = require("../model/polda");
const Polres = require("../model/polres");

Polda.hasMany(Input_operasi_bukti, { foreignKey: "polda_id", as: "bukti" });
Polres.hasMany(Input_operasi_bukti, { foreignKey: "polres_id", as: "bukti" });
const decAes = (token) =>
  AESDecrypt(token, {
    isSafeUrl: true,
    parseMode: "string",
  });
module.exports = class OperasiBuktiController {
  static get = async (req, res) => {
    const {
      polda_id,
      polres_id,
      operasi_id,
      start_date,
      end_date,
      date,
      limit,
      page,
    } = req.query;
    try {
      const wheres = {};
      let finals = await Polda.findAll({
        group: ["polda.id"],
        attributes: [
          "id",
          "name_polda",
          [Sequelize.fn("sum", Sequelize.col("sim")), "sim"],
          [Sequelize.fn("sum", Sequelize.col("stnk")), "stnk"],
          [
            Sequelize.fn("sum", Sequelize.col("kendaraan_bermotor")),
            "kendaraan_bermotor",
          ],
        ],
        include: [
          {
            model: Input_operasi_bukti,
            required: false,
            as: "bukti",
            attributes: [],
          },
        ],
      });

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
  //           sim: item.sim,
  //           stnk: item.stnk,
  //           kendaraan_bermotor: item.kendaraan_bermotor,
  //         });
  //       });
  //       let insertDataPolda = await Input_operasi_bukti.bulkCreate(
  //         dataInputPolda,
  //         { transaction: transaction }
  //       );
  //     } else {
  //       let checkData = await Input_operasi_bukti.findOne({
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
  //         sim: req.body.sim,
  //         stnk: req.body.stnk,
  //         kendaraan_bermotor: req.body.kendaraan_bermotor,
  //       };
  //       if (checkData) {
  //         let updateData = await Input_operasi_bukti.update(inputData, {
  //           where: {
  //             polda_id: decAes(req.body.polda_id),
  //             polres_id: decAes(req.body.polres_id),
  //             date: req.body.date,
  //             operasi_id: decAes(req.body.operasi_id),
  //           },
  //           transaction: transaction,
  //         });
  //       } else {
  //         let insertData = await Input_operasi_bukti.create(inputData, {
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
          sim: item.sim,
          stnk: item.stnk,
          kendaraan_bermotor: item.kendaraan_bermotor,
        });
      });
      let insertDataPolda = await Input_operasi_bukti.bulkCreate(
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
