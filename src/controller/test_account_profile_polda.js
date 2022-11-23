const { AESDecrypt } = require("../lib/encryption");
const response = require("../lib/response");
const Test_account_profile_polda = require("../model/test_account_profile_polda");
const db = require("../config/database");
const fs = require("fs");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const formidable = require("formidable");
let fieldData = {
  test_account_id: null,
  polda_id: null,
};
module.exports = class Test_account_profile_poldaController {
  static add = async (req, res) => {
    const transaction = await db.transaction();

    try {
      let inputs = {
        test_account_id: AESDecrypt(req.body.test_account_id, {
          isSafeUrl: true,
          parseMode: "string",
        }),
        polda_id: AESDecrypt(req.body.polda_id, {
          isSafeUrl: true,
          parseMode: "string",
        }),
      };
      let checkTestAccountPoldaExist = await Test_account_profile_polda.findAll(
        {
          where: inputs,
        }
      );
      if (checkTestAccountPoldaExist.length > 0) {
        return response(
          res,
          false,
          "Account Officer Sudah Ada",
          checkTestAccountPoldaExist
        );
      }
      await Test_account_profile_polda.create(inputs, {
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

      await Test_account_profile_polda.update(inputs, {
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
      await Test_account_profile_polda.destroy({
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
