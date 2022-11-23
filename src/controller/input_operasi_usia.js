const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const Input_operasi_usia = require("../model/operasi_lg_usia");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");

const decAes = (token) =>
  AESDecrypt(token, {
    isSafeUrl: true,
    parseMode: "string",
  });
module.exports = class OperasiUsiaController {
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
  //           max_15: item.max_15,
  //           max_20: item.max_20,
  //           max_25: item.max_25,
  //           max_30: item.max_30,
  //           max_35: item.max_35,
  //           max_40: item.max_40,
  //           max_45: item.max_45,
  //           max_50: item.max_50,
  //           max_55: item.max_55,
  //           max_60: item.max_60,
  //           lain_lain: item.lain_lain,
  //         });
  //       });
  //       let insertDataPolda = await Input_operasi_usia.bulkCreate(
  //         dataInputPolda,
  //         { transaction: transaction }
  //       );
  //     } else {
  //       let checkData = await Input_operasi_usia.findOne({
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
  //         max_15: req.body.max_15,
  //         max_20: req.body.max_20,
  //         max_25: req.body.max_25,
  //         max_30: req.body.max_30,
  //         max_35: req.body.max_35,
  //         max_40: req.body.max_40,
  //         max_45: req.body.max_45,
  //         max_50: req.body.max_50,
  //         max_55: req.body.max_55,
  //         max_60: req.body.max_60,
  //         lain_lain: req.body.lain_lain,
  //       };
  //       if (checkData) {
  //         let updateData = await Input_operasi_usia.update(inputData, {
  //           where: {
  //             polda_id: decAes(req.body.polda_id),
  //             polres_id: decAes(req.body.polres_id),
  //             date: req.body.date,
  //             operasi_id: decAes(req.body.operasi_id),
  //           },
  //           transaction: transaction,
  //         });
  //       } else {
  //         let insertData = await Input_operasi_usia.create(inputData, {
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
          max_15: item.max_15,
          max_20: item.max_20,
          max_25: item.max_25,
          max_30: item.max_30,
          max_35: item.max_35,
          max_40: item.max_40,
          max_45: item.max_45,
          max_50: item.max_50,
          max_55: item.max_55,
          max_60: item.max_60,
          lain_lain: item.lain_lain,
        });
      });
      let insertDataPolda = await Input_operasi_usia.bulkCreate(
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
