const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const Input_operasi_lokasi_kawasan = require("../model/operasi_lg_lokasi_kawasan");
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
module.exports = class OperasiLokasiKawasanController {
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
