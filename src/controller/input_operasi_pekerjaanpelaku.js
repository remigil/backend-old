const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const Input_operasi_profesi = require("../model/operasi_lk_pekerjaan_pelaku");
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
module.exports = class OperasiProfesiController {
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
  //           pns: item.pns,
  //           karyawan: item.karyawan,
  //           tni: item.tni,
  //           polri: item.polri,
  //           mahasiswa: item.mahasiswa,
  //           pengemudi: item.pengemudi,
  //           lain_lain: item.lain_lain,
  //         });
  //       });
  //       let insertDataPolda = await Input_operasi_profesi.bulkCreate(
  //         dataInputPolda,
  //         { transaction: transaction }
  //       );
  //     } else {
  //       let checkData = await Input_operasi_profesi.findOne({
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
  //         pns: req.body.pns,
  //         karyawan: req.body.karyawan,
  //         tni: req.body.tni,
  //         polri: req.body.polri,
  //         mahasiswa: req.body.mahasiswa,
  //         pengemudi: req.body.pengemudi,
  //         lain_lain: req.body.lain_lain,
  //       };
  //       if (checkData) {
  //         let updateData = await Input_operasi_profesi.update(inputData, {
  //           where: {
  //             polda_id: decAes(req.body.polda_id),
  //             polres_id: decAes(req.body.polres_id),
  //             date: req.body.date,
  //             operasi_id: decAes(req.body.operasi_id),
  //           },
  //           transaction: transaction,
  //         });
  //       } else {
  //         let insertData = await Input_operasi_profesi.create(inputData, {
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
    try {
      const transaction = await db.transaction();
      let dataInputPolda = [];
      req.body?.value.map((item) => {
        dataInputPolda.push({
          polda_id: decAes(item.polda_id),
          date: item.date,
          operasi_id: decAes(item.operasi_id),
          pns: item.pns,
          karyawan: item.karyawan,
          tni: item.tni,
          polri: item.polri,
          mahasiswa: item.mahasiswa,
          pengemudi: item.pengemudi,
          lain_lain: item.lain_lain,
        });
      });
      let insertDataPolda = await Input_operasi_profesi.bulkCreate(
        dataInputPolda,
        {
          transaction: transaction,
        }
      );
      await transaction.commit();
      response(res, true, "Succeed", null);
    } catch (error) {
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };
};
