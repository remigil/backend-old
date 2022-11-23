const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const Input_operasi_lakalantas = require("../model/operasi_lk_lakalantas");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");
const Polda = require("../model/polda");

Polda.hasMany(Input_operasi_lakalantas, {
  foreignKey: "polda_id",
  as: "operasi-lakalantas",
});

const decAes = (token) =>
  AESDecrypt(token, {
    isSafeUrl: true,
    parseMode: "string",
  });
module.exports = class OperasiProfesiController {
  static mobile_lakalantas = async (req, res) => {
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

      const modelAttr = Object.keys(Input_operasi_lakalantas.getAttributes());
      let getDataRules = {
        group: ["polda.id"],
        include: [
          {
            model: Input_operasi_lakalantas,
            required: false,
            as: "operasi-lakalantas",
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
          } else if (filter === "jumlah_kecelakaan") {
            whereBuilder.push([
              Sequelize.literal(
                "SUM(meninggal_dunia + luka_berat + luka_ringan)"
              ),
              "value",
            ]);
          }
        });
      } else {
        modelAttr.forEach((key) => {
          if (
            key == "meninggal_dunia" ||
            key == "luka_berat" ||
            key == "luka_ringan"
          ) {
            whereBuilder.push(
              [Sequelize.fn("sum", Sequelize.col(`${key}`)), key],
              [
                Sequelize.literal(
                  "SUM(meninggal_dunia + luka_ringan + luka_berat)"
                ),
                "jumlah_kecelakaan",
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
  //           meninggal_dunia: item.meninggal_dunia,
  //           luka_berat: item.luka_berat,
  //           luka_ringan: item.luka_ringan,
  //           kerugian_material: item.kerugian_material,
  //         });
  //       });
  //       let insertDataPolda = await Input_operasi_lakalantas.bulkCreate(
  //         dataInputPolda,
  //         { transaction: transaction }
  //       );
  //     } else {
  //       let checkData = await Input_operasi_lakalantas.findOne({
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
  //         meninggal_dunia: req.body.meninggal_dunia,
  //         luka_berat: req.body.luka_berat,
  //         luka_ringan: req.body.luka_ringan,
  //         kerugian_material: req.body.kerugian_material,
  //       };
  //       if (checkData) {
  //         let updateData = await Input_operasi_lakalantas.update(inputData, {
  //           where: {
  //             polda_id: decAes(req.body.polda_id),
  //             polres_id: decAes(req.body.polres_id),
  //             date: req.body.date,
  //             operasi_id: decAes(req.body.operasi_id),
  //           },
  //           transaction: transaction,
  //         });
  //       } else {
  //         let insertData = await Input_operasi_lakalantas.create(inputData, {
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
          meninggal_dunia: item.meninggal_dunia,
          luka_berat: item.luka_berat,
          luka_ringan: item.luka_ringan,
          kerugian_material: item.kerugian_material,
        });
      });
      let insertDataPolda = await Input_operasi_lakalantas.bulkCreate(
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
