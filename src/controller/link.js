const { AESDecrypt, AESEncrypt } = require("../lib/encryption");
const response = require("../lib/response");
const db = require("../config/database");
const fs = require("fs");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const formidable = require("formidable");
const Link = require("../model/link");
const pagination = require("../lib/pagination-parser");

const fieldData = {
  title: null,
  is_header: null,
  is_modal: null,
  parent_id: null,
  url: null,
  icon: null,
};
module.exports = class LinkController {
  static get = async (req, res) => {
    try {
      //   const {
      //     length = 10,
      //     start = 0,
      //     serverSide = null,
      //     search = null,
      //     filter = [],
      //     filterSearch = [],
      //     order = null,
      //     orderDirection = "asc",
      //   } = req.query;
      //   const modelAttr = Object.keys(Link.getAttributes());
      //   let getData = { where: null };
      //   if (serverSide?.toLowerCase() === "true") {
      //     const resPage = pagination.getPagination(length, start);
      //     getData.limit = resPage.limit;
      //     getData.offset = resPage.offset;
      //   }
      //   // getDataRules.order = [[modelAttr[order], orderDirection.toUpperCase()]];
      //   getData.order = [
      //     [
      //       order != null ? order : "id",
      //       orderDirection != null ? orderDirection : "asc",
      //     ],
      //   ];
      //   if (search != null) {
      //     let whereBuilder = [];
      //     modelAttr.forEach((key) => {
      //       whereBuilder.push(
      //         Sequelize.where(
      //           Sequelize.fn(
      //             "lower",
      //             Sequelize.cast(Sequelize.col(key), "varchar")
      //           ),
      //           {
      //             [Op.like]: `%${search.toLowerCase()}%`,
      //           }
      //         )
      //       );
      //     });
      //     getData.where = {
      //       [Op.or]: whereBuilder,
      //     };
      //   }
      //   if (
      //     filter != null &&
      //     filter.length > 0 &&
      //     filterSearch != null &&
      //     filterSearch.length > 0
      //   ) {
      //     const filters = [];
      //     filter.forEach((fKey, index) => {
      //       if (_.includes(modelAttr, fKey)) {
      //         filters[fKey] = filterSearch[index];
      //       }
      //     });
      //     getData.where = {
      //       ...getData.where,
      //       ...filters,
      //     };
      //   }
      //   const data = await Link.findAll(getData);
      //   const count = await Link.count({
      //     where: getData?.where,
      //   });
      const [data_header] = await db.query(
        `SELECT * FROM link WHERE is_header is true`
      );
      for (let i = 0; i < data_header.length; i++) {
        let [data_modal] = await db.query(
          `SELECT * FROM link where  parent_id=${data_header[i].id}`
        );
        for (let j = 0; j < data_modal.length; j++) {
          let [list_modal] = await db.query(
            `SELECT * FROM link where parent_id=${data_modal[j].id}`
          );
          data_modal[j].id = AESEncrypt(String(data_modal[j].id), {
            isSafeUrl: true,
          });
          data_modal[j].list = list_modal;
        }
        data_header[i].id = AESEncrypt(String(data_header[i].id), {
          isSafeUrl: true,
        });
        data_header[i].list = data_modal;
      }
      response(res, true, "Succeed", data_header);
      //   response(res, true, "Succeed", {
      //     data,
      //     recordsFiltered: count,
      //     recordsTotal: count,
      //   });
    } catch (e) {
      response(res, false, e.message, e);
    }
  };

  static getId = async (req, res) => {
    try {
      const data = await Link.findOne({
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
    var icon = "";
    try {
      let fieldValueData = {};
      Object.keys(fieldData).forEach((key) => {
        if (req.body[key]) {
          if (key == "icon") {
            let path = req.body.icon.filepath;
            let file = req.body.icon;
            let fileName = file.originalFilename;
            fs.renameSync(
              path,
              "./public/uploads/icon/" + fileName,
              function (err) {
                if (err) throw err;
              }
            );
            fieldValueData[key] = fileName;
          } else if (key == "parent_id") {
            fieldValueData[key] = AESDecrypt(req.body[key], {
              isSafeUrl: true,
              parseMode: "string",
            });
          } else {
            fieldValueData[key] = req.body[key];
          }
        } else {
          fieldValueData[key] = null;
        }
      });

      let op = await Link.create(fieldValueData, {
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
          if (key == "icon") {
            let path = req.body.icon.filepath;
            let file = req.body.icon;
            let fileName = file.originalFilename;
            fs.renameSync(
              path,
              "./public/uploads/icon/" + fileName,
              function (err) {
                if (err) throw err;
              }
            );
            fieldValueData[key] = fileName;
          } else if (key == "parent_id") {
            fieldValueData[key] = AESDecrypt(req.body[key], {
              isSafeUrl: true,
              parseMode: "string",
            });
          } else {
            fieldValueData[key] = req.body[key];
          }
        }
      });

      await Link.update(fieldValueData, {
        where: {
          id: req.params.id,
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
      await Link.update(fieldValue, {
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
      await Link.destroy({
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
