const db = require("../config/database");
const response = require("../lib/response");
const Regulation_doc = require("../model/regulation_doc");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");
const { getPagination } = require("../lib/pagination-parser");

const fieldData = {
  regulation_category: null,
  regulation_name: null,
  fileReg: null,
  year: null,
};

module.exports = class Regulation_docController {
  static get = async (req, res) => {
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
      const modelAttr = Object.keys(Regulation_doc.getAttributes());
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
      getDataRules.where = {
        deleted_at: {
          [Op.is]: null,
        },
      };
      const data = await Regulation_doc.findAll(getDataRules);
      const count = await Regulation_doc.count({
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
  static getMobile = async (req, res) => {
    try {
      const { order, orderDirection = "asc", search, kategori } = req.query;

      let getData = { where: {} };
      let { limit, page } = req.query;
      page = page ? parseInt(page) : 1;
      const resPage = getPagination(limit, page);
      getData.limit = parseInt(resPage.limit);
      getData.offset = resPage.offset;
      getData.order = [
        [
          order != null ? order : "id",
          orderDirection != null ? orderDirection : "desc",
        ],
      ];
      let whereBuilder = [];
      if (search != null) {
        const modelAttr = Object.keys(Regulation_doc.getAttributes());
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
        getData.where = {
          [Op.or]: whereBuilder,
        };
      }

      if (kategori != undefined) {
        getData.where = {
          ...getData.where,
          regulation_category: kategori,
        };
      }

      const data = await Regulation_doc.findAndCountAll(getData);

      response(res, true, "Succeed", {
        page,
        limit: parseInt(limit),
        total: data.count,
        total_page: Math.ceil(parseInt(data.count) / parseInt(resPage.limit)),
        ...data,
      });
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };
  static getId = async (req, res) => {
    try {
      const data = await Regulation_doc.findOne({
        where: {
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
    var fileReg = "";
    try {
      let fieldValueData = {};
      Object.keys(fieldData).forEach((key) => {
        if (req.body[key]) {
          if (key == "fileReg") {
            let path = req.body.fileReg.filepath;
            let file = req.body.fileReg;
            let fileName = file.originalFilename;
            fs.renameSync(
              path,
              "./public/uploads/regulation_doc/" + fileName,
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
      let op = await Regulation_doc.create(fieldValueData, {
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
      Object.keys(fieldData).forEach((key) => {
        if (req.body[key]) {
          if (key == "fileReg") {
            let path = req.body.fileReg.filepath;
            let file = req.body.fileReg;
            let fileName = file.originalFilename;
            fs.renameSync(
              path,
              "./public/uploads/regulation_doc/" + fileName,
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
      await Regulation_doc.update(fieldValueData, {
        where: {
          id: AESDecrypt(req.params.id, {
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
  static delete = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let fieldValue = {};
      fieldValue["deleted_at"] = new Date();
      await Regulation_doc.update(fieldValue, {
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
      await Regulation_doc.destroy({
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
