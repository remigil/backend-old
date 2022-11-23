const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const Input_operasi_sim = require("../model/operasi_lg_sim");
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
module.exports = class OperasiSimController {
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
  //           sim_a: item.sim_a,
  //           sim_a_umum: item.sim_a_umum,
  //           sim_b: item.sim_b,
  //           sim_b_satu_umum: item.sim_b_satu_umum,
  //           sim_b_dua_umum: item.sim_b_dua_umum,
  //           sim_c: item.sim_c,
  //           sim_d: item.sim_d,
  //           sim_internasional: item.sim_internasional,
  //           tanpa_sim: item.tanpa_sim,
  //         });
  //       });
  //       let insertDataPolda = await Input_operasi_sim.bulkCreate(
  //         dataInputPolda,
  //         { transaction: transaction }
  //       );
  //     } else {
  //       let checkData = await Input_operasi_sim.findOne({
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
  //         sim_a: req.body.sim_a,
  //         sim_a_umum: req.body.sim_a_umum,
  //         sim_b: req.body.sim_b,
  //         sim_b_satu_umum: req.body.sim_b_satu_umum,
  //         sim_b_dua_umum: req.body.sim_b_dua_umum,
  //         sim_c: req.body.sim_c,
  //         sim_d: req.body.sim_d,
  //         sim_internasional: req.body.sim_internasional,
  //         tanpa_sim: req.body.tanpa_sim,
  //       };
  //       if (checkData) {
  //         let updateData = await Input_operasi_sim.update(inputData, {
  //           where: {
  //             polda_id: decAes(req.body.polda_id),
  //             polres_id: decAes(req.body.polres_id),
  //             date: req.body.date,
  //             operasi_id: decAes(req.body.operasi_id),
  //           },
  //           transaction: transaction,
  //         });
  //       } else {
  //         let insertData = await Input_operasi_sim.create(inputData, {
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
          sim_a: item.sim_a,
          sim_a_umum: item.sim_a_umum,
          sim_b: item.sim_b,
          sim_b_satu_umum: item.sim_b_satu_umum,
          sim_b_dua_umum: item.sim_b_dua_umum,
          sim_c: item.sim_c,
          sim_d: item.sim_d,
          sim_internasional: item.sim_internasional,
          tanpa_sim: item.tanpa_sim,
        });
      });
      await transaction.commit();
      response(res, true, "Succeed", null);
    } catch (error) {
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };
};
