const { AESDecrypt } = require("../lib/encryption");
const response = require("../lib/response");
const OperationProfilePolda = require("../model/operation_profile_polda");
const db = require("../config/database");
const fs = require("fs");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const formidable = require("formidable");
let fieldData = {
  operation_profile_id: null,
  polda_id: null,
};
module.exports = class OperationProfilePoldaController {
  static add = async (req, res) => {
    const transaction = await db.transaction();

    try {
      let inputs = {
        operation_profile_id: AESDecrypt(req.body.operation_profile_id, {
          isSafeUrl: true,
          parseMode: "string",
        }),
        polda_id: AESDecrypt(req.body.polda_id, {
          isSafeUrl: true,
          parseMode: "string",
        }),
      };
      let checkOperationProfilePoldaExist = await OperationProfilePolda.findAll(
        {
          where: inputs,
        }
      );
      if (checkOperationProfilePoldaExist.length > 0) {
        return response(
          res,
          false,
          "Account Officer Sudah Ada",
          checkOperationProfilePoldaExist
        );
      }
      await OperationProfilePolda.create(inputs, { transaction: transaction });
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

      await OperationProfilePolda.update(inputs, {
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
      await OperationProfilePolda.destroy({
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
