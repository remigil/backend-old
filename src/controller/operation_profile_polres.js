const { AESDecrypt } = require("../lib/encryption");
const response = require("../lib/response");
const OperationProfilePolres = require("../model/operation_profile_polres");
const db = require("../config/database");
const fs = require("fs");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const formidable = require("formidable");
let fieldData = {
  operation_profile_id: null,
  polres_id: null,
};
module.exports = class OperationProfilePolresController {
  static add = async (req, res) => {
    const transaction = await db.transaction();

    try {
      let inputs = {
        operation_profile_id: AESDecrypt(req.body.operation_profile_id, {
          isSafeUrl: true,
          parseMode: "string",
        }),
        polres_id: AESDecrypt(req.body.polres_id, {
          isSafeUrl: true,
          parseMode: "string",
        }),
      };
      let checkOperationProfilePolresExist =
        await OperationProfilePolres.findAll({
          where: inputs,
        });
      if (checkOperationProfilePolresExist.length > 0) {
        return response(
          res,
          false,
          "Account Officer Sudah Ada",
          checkOperationProfilePolresExist
        );
      }
      await OperationProfilePolres.create(inputs, { transaction: transaction });
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

      await OperationProfilePolres.update(inputs, {
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
      await OperationProfilePolres.destroy({
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
