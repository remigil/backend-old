const db = require("../config/database");
const response = require("../lib/response");
const News = require("../model/news");
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
const CategoryNews = require("../model/category_news");

const fieldData = {
  news_category: null,
  title: null,
  content: null,
  picture: null,
  author: null,
  date: null,
};

const decAes = (token) =>
  AESDecrypt(token, {
    isSafeUrl: true,
    parseMode: "string",
  });
module.exports = class NewsController {
  static get = async (req, res) => {
    try {
      let { limit, page } = req.query;
      page = page ? parseInt(page) : 1;
      const resPage = pagination.getPagination(limit, page);
      const news = await News.findAndCountAll({
        order: [["date", "DESC"]],
        // raw: true,
        nest: true,
        limit: resPage.limit,
        offset: resPage.offset,
        attributes: {
          exclude: ["news_category"],
        },
        include: [
          {
            model: CategoryNews,
            attributes: ["id", "name_category_news"],
          },
        ],
      });

      let rows = news.rows;

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
        total_page: Math.ceil(parseInt(news.count) / parseInt(resPage.limit)),
        recordsFiltered: news.count,
        recordsTotal: news.count,
        datanya,

        // groupedData,
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
      const news = await News.findAndCountAll({
        order: [["created_at", "DESC"]],
        // raw: true,
        nest: true,
        // limit: resPage.limit,
        offset: resPage.offset,
      });

      let rangeup = page + 1 <= news.count ? page : news.count;
      let rangedown = page - 4 < 1 ? page + 4 : page - 4;

      response(res, true, "Succeed", {
        // limit,
        page,
        rangeup,
        rangedown,
        total_page: news.count,
        // total_page: Math.ceil(parseInt(news.count) / parseInt(resPage.limit)),
        ...news, // newsid,
      });
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };

  static getIdweb = async (req, res) => {
    try {
      const data = await News.findOne({
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
    var picture = "";
    try {
      let fieldValueData = {};
      Object.keys(fieldData).forEach((key) => {
        if (req.body[key]) {
          if (key == "picture") {
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
            fieldValueData[key] = fileName;
          } else {
            fieldValueData[key] = req.body[key];
          }
        } else {
          fieldValueData[key] = null;
        }
      });

      fieldValueData.news_category = decAes(req.body.news_category);

      // let getDate = req.body["date"];
      // let getMonth = getDate.split("-");
      // let convertMonth = `${getMonth[2]}-${getMonth[1]}-${getMonth[0]}`;

      // let changeInt = parseInt(getMonth[1]);
      // let convertMonth = dateConvert(changeInt);
      // let convertMonth = dateConvert(changeInt);

      // fieldValueData["date"] = `${getMonth[2]} ${convertMonth} ${getMonth[0]}`;
      // fieldValueData["date"] = convertMonth;

      let op = await News.create(fieldValueData, {
        transaction: transaction,
      });
      await transaction.commit();
      response(res, true, "Succeed", op);
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
      await News.update(fieldValue, {
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
      await News.destroy({
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
