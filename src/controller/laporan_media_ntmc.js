const db = require("../config/database");
const response = require("../lib/response");
const Laporan_media_ntmc = require("../model/laporan_media_ntmc");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
// const dateConvert = require("../middleware/dateConvert");
// const reversedateConvert = require("../middleware/reversedateConvert");
const pagination = require("../lib/pagination-parser");
const moment = require("moment");
// const TimeAgo = require("javascript-time-ago");
const { groupBy } = require("lodash");

// Indo.
// const en = require("javascript-time-ago/locale/id");
// TimeAgo.addDefaultLocale(en);

const fs = require("fs");

const fieldData = {
  title: null,
  file: null,
  cover: null,
  date: null,
  tipe: null,
};

const decAes = (token) =>
  AESDecrypt(token, {
    isSafeUrl: true,
    parseMode: "string",
  });
module.exports = class LaporanMediaNTMCController {
  static get = async (req, res) => {
    try {
      let { limit, page } = req.query;
      page = page ? parseInt(page) : 1;
      const resPage = pagination.getPagination(limit, page);
      const LaporanMediaNTMC = await Laporan_media_ntmc.findAndCountAll({
        order: [["date", "DESC"]],
        // raw: true,
        nest: true,
        limit: resPage.limit,
        offset: resPage.offset,
      });

      let rows = LaporanMediaNTMC.rows;

      let date = groupBy(rows, (list) => list.date);
      let datanya = [];
      Object.keys(date).forEach((listDate) => {
        datanya.push({
          date: listDate,
          data: date[listDate],
        });
      });

      response(res, true, "Succeed", {
        limit,
        page,
        total_page: Math.ceil(
          parseInt(LaporanMediaNTMC.count) / parseInt(resPage.limit)
        ),
        recordsFiltered: LaporanMediaNTMC.count,
        recordsTotal: LaporanMediaNTMC.count,
        datanya,

        // groupedData,
      });
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };

  static getWeb = async (req, res) => {
    try {
      const {
        length = 10,
        start = 0,
        serverSide = null,
        search = null,
        filter = [],
        filterSearch = [],
        order = 0,
        orderDirection = "asc",
      } = req.query;
      const modelAttr = Object.keys(Laporan_media_ntmc.getAttributes());
      let getDataRules = { where: null };
      if (serverSide?.toLowerCase() === "true") {
        getDataRules.limit = length;
        getDataRules.offset = start;
      }
      if (order <= modelAttr.length) {
        getDataRules.order = [[modelAttr[order], orderDirection.toUpperCase()]];
      }
      if (search != null) {
        let whereBuilder = [];
        modelAttr.forEach((key) => {
          whereBuilder.push(
            Sequelize.where(
              Sequelize.fn(
                "lower",
                Sequelize.cast(Sequelize.col(key), "varchar")
              ),
              {
                [Op.like]: `%${search.toLowerCase()}%`,
              }
            )
          );
        });
        getDataRules.where = {
          [Op.or]: whereBuilder,
        };
      }
      if (
        filter != null &&
        filter.length > 0 &&
        filterSearch != null &&
        filterSearch.length > 0
      ) {
        const filters = [];
        filter.forEach((fKey, index) => {
          if (_.includes(modelAttr, fKey)) {
            filters[fKey] = filterSearch[index];
          }
        });
        getDataRules.where = {
          ...getDataRules.where,
          ...filters,
        };
      }
      const data = await Laporan_media_ntmc.findAll(getDataRules);
      const count = await Laporan_media_ntmc.count({
        where: getDataRules?.where,
      });
      response(res, true, "Succeed", {
        data,
        recordsFiltered: count,
        recordsTotal: count,
      });
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };

  static getId = async (req, res) => {
    try {
      let { page } = req.query;
      page = page ? parseInt(page) : 1;
      let limit = 1;

      const resPage = pagination.getPagination(limit, page);
      const Laporan_media_ntmc = await Laporan_media_ntmc.findAndCountAll({
        order: [["created_at", "DESC"]],
        // raw: true,
        nest: true,
        // limit: resPage.limit,
        offset: resPage.offset,
      });

      let rangeup =
        page + 1 <= Laporan_media_ntmc.count ? page : Laporan_media_ntmc.count;
      let rangedown = page - 4 < 1 ? page + 4 : page - 4;

      response(res, true, "Succeed", {
        // limit,
        page,
        rangeup,
        rangedown,
        total_page: Laporan_media_ntmc.count,
        // total_page: Math.ceil(parseInt(Laporan_media_ntmc.count) / parseInt(resPage.limit)),
        ...Laporan_media_ntmc, // newsid,
      });
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };

  static getIdweb = async (req, res) => {
    try {
      const data = await Laporan_media_ntmc.findOne({
        where: {
          // id: req.params.id,
          id: AESDecrypt(req.params.id, {
            isSafeUrl: true,
            parseMode: "string",
          }),
        },
      });
      response(res, true, "Succeed", {
        data,
      });
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };
  static add = async (req, res) => {
    const transaction = await db.transaction();

    try {
      let fieldValueData = {};
      Object.keys(fieldData).forEach((key) => {
        if (req.body[key]) {
          if (key == "file" || key == "cover") {
            let path = req.body[key].filepath;
            let file = req.body[key];
            let fileName = file.originalFilename;
            fs.copyFile(
              path,
              "./public/uploads/laporan_media_ntmc/" + fileName,
              function (err) {
                if (err) throw err;
              }
            );
            fieldValueData[key] = fileName;
          } else {
            fieldValueData[key] = req.body[key];
          }
        } else {
          fieldValueData[key] = null;
        }
      });

      let op = await Laporan_media_ntmc.create(fieldValueData, {
        transaction: transaction,
      });
      await transaction.commit();
      response(res, true, "Succeed", fieldValueData);
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };
  static edit = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let fieldValueData = {};
      Object.keys(fieldData).forEach((val, key) => {
        if (req.body[val]) {
          if (val == "picture") {
            let path = req.body.picture.filepath;
            let file = req.body.picture;
            let fileName = file.originalFilename;
            fs.renameSync(
              path,
              "./public/uploads/news/" + fileName,
              function (err) {
                if (err) throw err;
              }
            );
            fieldValueData[val] = fileName;
          } else {
            fieldValueData[val] = req.body[val];
          }
        }
        fieldValueData["news_category"] = AESDecrypt(req.body.news_category, {
          isSafeUrl: true,
          parseMode: "string",
        });
      });
      // let getDate = req.body["date"];
      // let getMonth = getDate.split("-");
      // let convertMonth = `${getMonth[2]}-${getMonth[1]}-${getMonth[0]}`;
      // fieldValueData["date"] = convertMonth;

      await News.update(fieldValueData, {
        where: {
          id: AESDecrypt(req.params.id, {
            isSafeUrl: true,
            parseMode: "string",
          }),
        },
        transaction: transaction,
      });
      await transaction.commit();
      response(res, true, "Succeed", fieldValueData);
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };
  static delete = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let fieldValue = {};
      fieldValue["deleted_at"] = new Date();
      await Laporan_media_ntmc.update(fieldValue, {
        where: {
          id: AESDecrypt(req.body.id, {
            isSafeUrl: true,
            parseMode: "string",
          }),
        },
        transaction: transaction,
      });
      await transaction.commit();
      response(res, true, "Succeed", null);
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };
  static hardDelete = async (req, res) => {
    const transaction = await db.transaction();
    try {
      await Laporan_media_ntmc.destroy({
        where: {
          id: AESDecrypt(req.body.id, {
            isSafeUrl: true,
            parseMode: "string",
          }),
        },
        transaction: transaction,
      });
      await transaction.commit();
      response(res, true, "Succeed", null);
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };
};
