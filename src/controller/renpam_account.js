const { AESDecrypt } = require("../lib/encryption");
const response = require("../lib/response");
const RenpamAccount = require("../model/renpam_account");
const db = require("../config/database");
const fs = require("fs");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const formidable = require("formidable");
let fieldData = {
  account_id: null,
  renpam_id: null,
};
module.exports = class RenpamAccountController {
  static add = async (req, res) => {
    const transaction = await db.transaction();

    try {
      let inputs = {
        account_id: AESDecrypt(req.body.account_id, {
          isSafeUrl: true,
          parseMode: "string",
        }),
        renpam_id: AESDecrypt(req.body.renpam_id, {
          isSafeUrl: true,
          parseMode: "string",
        }),
      };
      let checkRenpamAccountExist = await RenpamAccount.findAll({
        where: inputs,
      });
      if (checkRenpamAccountExist.length > 0) {
        return response(res, false, "Account Officer Sudah Ada", null);
      }
      await RenpamAccount.create(inputs, { transaction: transaction });
      await transaction.commit();
      response(res, true, "Succeed", null);
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };
  static edit = async (req, res) => {
    const transaction = await db.transaction();

    try {
      let inputs = {};
      Object.keys(fieldData).forEach((key) => {
        if (req.body[key]) {
          inputs[key] = AESDecrypt(req.body[key], {
            isSafeUrl: true,
            parseMode: "string",
          });
        }
      });

      await RenpamAccount.update(inputs, {
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
      await RenpamAccount.destroy({
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
