const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const Input_operasi_pendidikankorban = require("../model/operasi_lk_pendidikan_korban");
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
module.exports = class OperasiPendidikanKorbanController {
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
