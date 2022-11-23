const response = require("../lib/response");
const db = require("../config/database");
const Society = require("../model/society");
const Token = require("../model/token");
const bcrypt = require("bcrypt");
const {
  JWTEncrypt,
  JWTVerify,
  AESDecrypt,
  AESEncrypt,
} = require("../lib/encryption");
const moment = require("moment");
const { emailSendPass } = require("../lib/emailpassLibrary");
const { Op } = require("sequelize");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const fieldData = {
  nik: null,
  person_name: null,
  email: null,
  no_hp: null,
  password: null,
  no_sim: null,
  status_verifikasi: null,
};
// const client = require("twilio")(accountSid, authToken);

class Forgot_Password {
  static forgotPassword = async (req, res) => {
    const transaction = await db.transaction();
    try {
      const { email } = req.body;

      var Now = new Date();
      var ExpiredDate = new Date(Now.getTime() + 5 * 60000);
      // let otp = 123456;
      let otp = Math.floor(100000 + Math.random() * 900000);
      let otpp = otp.toString();
      let cekSociety = await Society.findOne({
        where: { email: email.toLowerCase() },
      });

      if (cekSociety.status_verifikasi == 0) {
        return response(res, false, "Failed", "Akun anda belum terverifikasi");
      }
      if (cekSociety.status_verifikasi == 1) {
        await Token.create(
          {
            token: AESEncrypt(otpp),
            token_created_date: new Date(),
            token_expired_date: ExpiredDate,
            no_hp: cekSociety.no_hp,
            typeToken: 2,
          },
          { transaction: transaction }
        );
        let aaa = emailSendPass(req, res, null, {
          email: cekSociety.email,
          code: otpp,
        });
        // let aaa = emailSendVerif(req, res, next);
        console.log({ aaa });
        await transaction.commit();
        response(res, true, "Succeed", null);
      } else {
        response(res, false, "Failed", "Email not found");
      }
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };

  static resendTokenPassword = async (req, res) => {
    const transaction = await db.transaction();
    try {
      const { email } = req.body;

      var Now = new Date();
      var ExpiredDate = new Date(Now.getTime() + 5 * 60000);
      // let otp = 123456;
      let otp = Math.floor(100000 + Math.random() * 900000);
      let otpp = otp.toString();
      let cekSociety = await Society.findOne({
        where: { email: email.toLowerCase() },
      });

      if (cekSociety) {
        // let cekData = await Token.findOne({
        //   where: { no_hp: cekSociety.no_hp, typeToken: 2 },
        // });

        // if (cekData) {
        //   response(res, true, "Succeed");
        // } else {
        let updateToken = await Token.update(
          // await Token.update(
          {
            token: AESEncrypt(otpp),
            token_created_date: new Date(),
            token_expired_date: ExpiredDate,
          },
          {
            where: { no_hp: cekSociety.no_hp, typeToken: 2 },
          },
          { transaction: transaction }
        );
        let aaa = emailSendPass(req, res, null, {
          email: cekSociety.email,
          code: otpp,
        });
        console.log({ aaa });
        await transaction.commit();
        response(res, true, "Succeed", null);
        // }
      } else {
        response(res, false, "Failed", "Email not found");
      }
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };

  static ValidateForgotPassword = async (req, res) => {
    const transaction = await db.transaction();
    try {
      const { email, token } = req.body;
      const getData = await Society.findOne({
        where: {
          email: email.toLowerCase(),
          status_verifikasi: 1,
        },
      });
      const getToken = await Token.findOne({
        where: {
          no_hp: getData.no_hp,
          typeToken: 2,
        },
        order: [["id", "DESC"]],
      });
      var Now = new Date();

      if (Now >= getToken.token_expired_date) {
        response(res, false, "Token expired", null);
      } else {
        if (token == AESDecrypt(getToken.token)) {
          await Society.update(
            {
              status_verifikasi: 1,
            },
            {
              where: {
                no_hp: getData.no_hp,
              },
            },
            { transaction: transaction }
          );
          await Token.update(
            {
              typeToken: 0,
            },
            {
              where: {
                no_hp: getData.no_hp,
              },
            },
            { transaction: transaction }
          );
          return response(res, true, "succeed");
        } else {
          response(res, false, "Token tidak sesuai", null, 401);
        }
      }
    } catch (e) {
      response(res, false, "failed!!", "Token tidak sesuai");
    }
  };

  static ChangePassword = async (req, res) => {
    const transaction = await db.transaction();
    try {
      const { email, password } = req.body;
      await Society.update(
        {
          password: password,
        },
        {
          where: {
            email: email.toLowerCase(),
          },
        },
        { transaction: transaction }
      );
      await transaction.commit();
      response(res, true, "Berhasil ganti password", null, 201);
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Gagal ganti password", null, 401);
    }
  };
}

module.exports = Forgot_Password;
