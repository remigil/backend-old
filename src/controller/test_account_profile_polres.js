const { AESDecrypt } = require("../lib/encryption");
const response = require("../lib/response");
const Test_account_profile_polres = require("../model/test_account_profile_polres");
const db = require("../config/database");
const fs = require("fs");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const formidable = require("formidable");
let fieldData = {
  test_account_id: null,
  polres_id: null,
};
module.exports = class Test_account_profile_polresController {
  static add = async (req, res) => {
    const transaction = await db.transaction();

    try {
      let inputs = {
        test_account_id: AESDecrypt(req.body.test_account_id, {
          isSafeUrl: true,
          parseMode: "string",
        }),
        polres_id: AESDecrypt(req.body.polres_id, {
          isSafeUrl: true,
          parseMode: "string",
        }),
      };
      let checkTestAccountPolresExist = await Test_account_profile_polres.findAll(
        {
          where: inputs,
        }
      );
      if (checkTestAccountPolresExist.length > 0) {
        return response(
          res,
          false,
          "Account Officer Sudah Ada",
          checkTestAccountPolresExist
        );
      }
      await Test_account_profile_polres.create(inputs, {
        transaction: transaction,
      });
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

      await Test_account_profile_polres.update(inputs, {
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
      await Test_account_profile_polres.destroy({
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
