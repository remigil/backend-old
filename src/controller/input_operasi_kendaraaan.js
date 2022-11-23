const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const Input_operasi_kendaraan = require("../model/operasi_lg_kendaraan");
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
module.exports = class OperasiKendaraanController {
  static add = async (req, res) => {
    const transaction = await db.transaction();
    try {
      const { polda } = req.query;
      if (polda) {
        let dataInputPolda = [];
        req.body?.value.map((item) => {
          dataInputPolda.push({
            polda_id: decAes(req.body.polda_id),
            date: req.body.date,
            polres_id: decAes(item.polres_id),
            operasi_id: decAes(req.body.operasi_id),
            bus: item.bus,
            mobil_penumpang: item.mobil_penumpang,
            mobil_barang: item.mobil_barang,
            ransus: item.ransus,
            sepeda_motor: item.sepeda_motor,
          });
        });
        let insertDataPolda = await Input_operasi_kendaraan.bulkCreate(
          dataInputPolda,
          { transaction: transaction }
        );
      } else {
        let checkData = await Input_operasi_kendaraan.findOne({
          where: {
            polda_id: decAes(req.body.polda_id),
            polres_id: decAes(req.body.polres_id),
            date: req.body.date,
            operasi_id: decAes(req.body.operasi_id),
          },
        });
        let inputData = {
          polda_id: decAes(req.body.polda_id),
          polres_id: decAes(req.body.polres_id),
          date: req.body.date,
          operasi_id: decAes(req.body.operasi_id),
          bus: req.body.bus,
          mobil_penumpang: req.body.mobil_penumpang,
          mobil_barang: req.body.mobil_barang,
          ransus: req.body.ransus,
          sepeda_motor: req.body.sepeda_motor,
        };
        if (checkData) {
          let updateData = await Input_operasi_kendaraan.update(inputData, {
            where: {
              polda_id: decAes(req.body.polda_id),
              polres_id: decAes(req.body.polres_id),
              date: req.body.date,
              operasi_id: decAes(req.body.operasi_id),
            },
            transaction: transaction,
          });
        } else {
          let insertData = await Input_operasi_kendaraan.create(inputData, {
            transaction: transaction,
          });
        }
      }
      await transaction.commit();
      response(res, true, "Succeed", null);
    } catch (error) {
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  static add = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let dataInputPolda = [];
      req.body?.value.map((item) => {
        dataInputPolda.push({
          polda_id: decAes(item.polda_id),
          operasi_id: decAes(item.operasi_id),
          date: item.date,
          bus: item.bus,
          mobil_penumpang: item.mobil_penumpang,
          mobil_barang: item.mobil_barang,
          ransus: item.ransus,
          sepeda_motor: item.sepeda_motor,
        });
      });
      let insertDataPolda = await Input_operasi_kendaraan.bulkCreate(
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
