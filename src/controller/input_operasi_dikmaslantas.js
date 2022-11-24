const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const Input_operasi_dikmaslantas = require("../model/operasi_lg_dikmaslantas");
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

const Polda = require("../model/polda");
Polda.hasMany(Input_operasi_dikmaslantas, {
  foreignKey: "polda_id",
  as: "op_dikmaslantas",
});

module.exports = class OperasiDikmaslantasController {
  static get_daily = async (req, res) => {
    const modelAttr = Object.keys(Input_operasi_dikmaslantas.getAttributes());
    try {
      const {
        start_date = null,
        end_date = null,
        filter = null,
        date = null,
        serverSide = null,
        length = null,
        start = null,
        polda_id = null,
        topPolda = null,
        limit = 34,
      } = req.query;

      const wheres = {};

      if (date) {
        wheres.date = {
          date: date,
        };
      }

      const getDataRules = {
        group: ["polda.id"],
        attributes: [
          "id",
          "name_polda",
          [Sequelize.fn("sum", Sequelize.col("media_cetak")), "media_cetak"],
          [
            Sequelize.fn("sum", Sequelize.col("media_elektronik")),
            "media_elektronik",
          ],
          [Sequelize.fn("sum", Sequelize.col("media_sosial")), "media_sosial"],
          [Sequelize.fn("sum", Sequelize.col("laka_langgar")), "laka_langgar"],
          [
            Sequelize.literal(
              "SUM(media_cetak + media_elektronik + media_sosial + laka_langgar)"
            ),
            "total",
          ],
        ],
        include: [
          {
            model: Input_operasi_dikmaslantas,
            required: false,
            as: "op_dikmaslantas",
            attributes: [],
            where: wheres,
          },
        ],
        nest: true,
        subQuery: false,
      };

      // if (filter) {
      //   getDataRules.include[0].where = {
      //     date: {
      //       [Op.between]: [start_date, end_date],
      //     },
      //   };
      // }

      // if (polda_id) {
      //   getDataRules.where = {
      //     id: decAes(polda_id),
      //   };
      // }

      // if (serverSide?.toLowerCase() === "true") {
      //   getDataRules.limit = length;
      //   getDataRules.offset = start;
      // }

      // let finals = await Polda.findAll(getDataRules);
      // const count = await Polda.count({
      //   where: getDataRules?.where,
      // });

      // let rows = [];

      // finals.map((element, index) => {
      //   rows.push({
      //     id: element.id,
      //     name_polda: element.name_polda,
      //     media_cetak: parseInt(element.dataValues.media_cetak) || 0,
      //     media_elektronik: parseInt(element.dataValues.media_elektronik) || 0,
      //     media_sosial: parseInt(element.dataValues.media_sosial) || 0,
      //     laka_langgar: parseInt(element.dataValues.laka_langgar) || 0,
      //     total: parseInt(element.dataValues.total) || 0,
      //   });
      // });

      // if (topPolda) {
      //   rows.sort((a, b) => b.total - a.total);
      //   rows = rows.slice(0, limit);
      // }
      response(res, true, "Succeed", null);
    } catch (error) {
      response(res, false, "Failed", error.message);
    }
  };

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
            media_cetak: item.media_cetak,
            media_sosial: item.media_sosial,
            media_elektronik: item.media_elektronik,
            laka_langgar: item.laka_langgar,
          });
        });
        let insertDataPolda = await Input_operasi_dikmaslantas.bulkCreate(
          dataInputPolda,
          { transaction: transaction }
        );
      } else {
        let checkData = await Input_operasi_dikmaslantas.findOne({
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
          media_cetak: req.body.media_cetak,
          media_sosial: req.body.media_sosial,
          media_elektronik: req.body.media_elektronik,
          laka_langgar: req.body.laka_langgar,
        };
        if (checkData) {
          let updateData = await Input_operasi_dikmaslantas.update(inputData, {
            where: {
              polda_id: decAes(req.body.polda_id),
              polres_id: decAes(req.body.polres_id),
              date: req.body.date,
              operasi_id: decAes(req.body.operasi_id),
            },
            transaction: transaction,
          });
        } else {
          let insertData = await Input_operasi_dikmaslantas.create(inputData, {
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
          date: item.date,
          operasi_id: decAes(item.operasi_id),
          media_cetak: item.media_cetak,
          media_sosial: item.media_sosial,
          media_elektronik: item.media_elektronik,
          laka_langgar: item.laka_langgar,
        });
      });
      let insertDataPolda = await Input_operasi_dikmaslantas.bulkCreate(
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
