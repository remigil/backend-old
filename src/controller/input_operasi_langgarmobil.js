const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const Input_operasi_langgarmobil = require("../model/operasi_lg_langgar_mobil");
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
module.exports = class OperasiLanggarMobilController {
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
  //           tanpa_sabuk: item.tanpa_sabuk,
  //           lain_lain: item.lain_lain,
  //         });
  //       });
  //       let insertDataPolda = await Input_operasi_langgarmobil.bulkCreate(
  //         dataInputPolda,
  //         { transaction: transaction }
  //       );
  //     } else {
  //       let checkData = await Input_operasi_langgarmobil.findOne({
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
  //         tanpa_sabuk: req.body.tanpa_sabuk,
  //         lain_lain: req.body.lain_lain,
  //       };
  //       if (checkData) {
  //         let updateData = await Input_operasi_langgarmobil.update(inputData, {
  //           where: {
  //             polda_id: decAes(req.body.polda_id),
  //             polres_id: decAes(req.body.polres_id),
  //             date: req.body.date,
  //             operasi_id: decAes(req.body.operasi_id),
  //           },
  //           transaction: transaction,
  //         });
  //       } else {
  //         let insertData = await Input_operasi_langgarmobil.create(inputData, {
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
          tanpa_sabuk: item.tanpa_sabuk,
          lain_lain: item.lain_lain,
        });
      });
      let insertDataPolda = await Input_operasi_langgarmobil.bulkCreate(
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
