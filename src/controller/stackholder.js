const db = require("../config/database");
const response = require("../lib/response");
const Stackholder = require("../model/stackholder");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");
const pagination = require("../lib/pagination-parser");



const field_stackholder = {
  title: null,
  icon: null,
  url: null,
};

module.exports = class StackController {
  static get = async (req, res) => {
    try {
      let data = await Stackholder.findAll();

      response(res, true, "Succeed", data);
    } catch (error) {
      response(res, false, "Failed", e.message);
    }
  };

  static add = async (req, res) => {
    const transaction = await db.transaction();
    var icon = "";
    try {
      let fieldValueData = {};
      Object.keys(field_stackholder).forEach((key) => {
        if (req.body[key]) {
          if (key == "icon") {
            let path = req.body.icon.filepath;
            let file = req.body.icon;
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

      let op = await Stackholder.create(fieldValueData, {
        transaction: transaction,
      });
      await transaction.commit();
      response(res, true, "Succeed", op);
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };
};

