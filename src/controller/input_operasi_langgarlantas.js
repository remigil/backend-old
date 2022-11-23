const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const Input_operasi_langgarlantas = require("../model/operasi_lg_langgarlantas");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const Polda = require("../model/polda");
const fs = require("fs");

Polda.hasMany(Input_operasi_langgarlantas, {
  foreignKey: "polda_id",
  as: "operasi-langgarlantas",
});

const decAes = (token) =>
  AESDecrypt(token, {
    isSafeUrl: true,
    parseMode: "string",
  });
module.exports = class OperasiLanggarLantasController {
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
