const { AESDecrypt } = require("../lib/encryption");
const response = require("../lib/response");
const AccountProfile = require("../model/trx_account_officer");
const db = require("../config/database");
const fs = require("fs");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const formidable = require("formidable");
let fieldData = {
  account_id: null,
  officer_id: null,
  vehicle_id: null,
};
module.exports = class AccountProfileController {
  static add = async (req, res) => {
    const transaction = await db.transaction();

    try {
      let inputs = {
        account_id: AESDecrypt(req.body.account_id, {
          isSafeUrl: true,
          parseMode: "string",
        }),
        officer_id: AESDecrypt(req.body.officer_id, {
          isSafeUrl: true,
          parseMode: "string",
        }),
      };
      let checkAccountProfileExist = await AccountProfile.findAll({
        where: inputs,
      });
      if (checkAccountProfileExist.length > 0) {
        return response(res, false, "Account Officer Sudah Ada", null);
      }
      await AccountProfile.create(inputs, { transaction: transaction });
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

      await AccountProfile.update(inputs, {
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
      var data = await AccountProfile.destroy({
        where: {
          id: AESDecrypt(req.body.id, {
            isSafeUrl: true,
            parseMode: "string",
          }),
        },
        transaction: transaction,
      });
      await transaction.commit();
      response(res, true, "Succeed", data);
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };

  static delete2param = async (req, res) => {
    const transaction = await db.transaction();
    try {
      var data = await AccountProfile.destroy({
        where: {
          account_id: AESDecrypt(req.body.account_id, {
            isSafeUrl: true,
            parseMode: "string",
          }),
          officer_id: AESDecrypt(req.body.officer_id, {
            isSafeUrl: true,
            parseMode: "string",
          }),
        },
        transaction: transaction,
      });
      await transaction.commit();
      response(res, true, "Succeed", data);
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };
};
