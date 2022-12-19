const db = require("../config/database");
const response = require("../lib/response");
const Stackholder = require("../model/stackholder");

const Layanan_Stackholder = require("../model/layanan_stackholder");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");
const pagination = require("../lib/pagination-parser");

Stackholder.hasMany(Layanan_Stackholder, {
  foreignKey: "stackholder_id",
  as: "layanan_stackholder",
});

const field_stackholder = {
  title: null,
  icon: null,
  url: null,
  alamat: null,
  no_telp: null,
  call_center: null,
  email: null,
  fax: null,
  facebook: null,
  twitter: null,
  instagram: null,
  youtube: null,
  latitude: null,
  longitude: null,
  link_playlist: null,
};

module.exports = class StackController {
  static get = async (req, res) => {
    try {
      let data = await Stackholder.findAll({
        include: [
          {
            model: Layanan_Stackholder,
            as: "layanan_stackholder",
            required: false,
          },
        ],
      });

      response(res, true, "Succeed", data);
    } catch (error) {
      response(res, false, "Failed", e.message);
    }
  };

  static edit = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let input = {};
      Object.keys(field_stackholder).forEach((val, key) => {
        if (req.body[val]) {
          if (val == "icon") {
            let path = req.body.icon.filepath;
            let file = req.body.icon;
            let fileNameLogo = file.originalFilename;
            fs.renameSync(
              path,
              "./public/uploads/stakeholder/" + fileNameLogo,
              function (err) {
                if (err) throw err;
              }
            );
            input[val] = fileNameLogo;
          } else {
            input[val] = req.body[val];
          }
        }
      });
      let op = await Stackholder.update(input, {
        where: {
          id: AESDecrypt(req.params.id, {
            isSafeUrl: true,
            parseMode: "string",
          }),
        },
        transaction: transaction,
      });
      await transaction.commit();
      response(res, true, "Succeed", input);
    } catch (e) {
      await transaction.rollback();
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
              "./public/uploads/stakeholder/" + fileName,
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

  static delete = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let fieldValue = {};
      fieldValue["deleted_at"] = new Date();
      await Stackholder.update(fieldValue, {
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
      await Stackholder.destroy({
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

