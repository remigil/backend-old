const response = require("../lib/response");
const User = require("../model/user");
const bcrypt = require("bcrypt");
const { JWTEncrypt, JWTVerify, AESDecrypt } = require("../lib/encryption");
const moment = require("moment");
const TokenTrackNotif = require("../model/token_track_notif");
const Officer = require("../model/officer");
const Account = require("../model/account");

class Authentication {
  static login = async (req, res) => {
    const user = await User.findOne({
      where: {
        username: req.body.username,
        status_verifikasi: 1,
      },
    });
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        const accessToken = JWTEncrypt({
          uid: user.id,
          timestamp: moment().unix(),
        });
        return response(res, true, "Login succeed", {
          accessToken,
        });
      }
    }
    response(res, false, "Login failed, please try again!", null, 401);
  };
  static loginMobile = async (req, res) => {
    try {
      const account = await Account.findOne({
        where: {
          name_account: req.body.team,
        },
      });

      const officer = await Officer.findOne({
        where: {
          nrp_officer: req.body.nrp_user,
        },
      });

      if (!officer) {
        return response(
          res,
          false,
          "Akun Anda Tidak Terdaftar di database kami",
          401
        );
      }

      let nrp_user = await TokenTrackNotif.findOne({
        where: {
          nrp_user: officer.nrp_officer,
        },
      });

      if (nrp_user) {
        if (nrp_user.device_user != req.body.device_user) {
          return response(
            res,
            false,
            "Data Anda Telah ada di device lainnya, silahkan login menggunakan device sebelumnya"
          );
        }
      } else {
        nrp_user = (
          await TokenTrackNotif.create({
            nrp_user: officer.nrp_officer,
            device_user: req.body.device_user,
            team_id: AESDecrypt(account.id, {
              isSafeUrl: true,
              parseMode: "string",
            }),
          })
        ).dataValues;
      }

      if (account) {
        if (bcrypt.compareSync(req.body.password, account.password)) {
          const accessToken = JWTEncrypt({
            uid: account.id,
            nrp_user: nrp_user.id,
            officer: officer.id,
            timestamp: moment().unix(),
          });
          return response(res, true, "Login succeed", {
            accessToken,
          });
        } else {
          response(
            res,
            false,
            "Login failed, please check your Password!",
            account,
            401
          );
        }
      } else {
        response(
          res,
          false,
          "Login failed, please check your Username!",
          account,
          401
        );
      }
    } catch (error) {
      response(res, false, "Login failed, please try again!", error.message);
    }
  };
  static validateLogin = async (req, res) => {
    try {
      const authHeader = req.headers["authorization"];
      const verify = JWTVerify(authHeader);
      return response(res, true, "Login succeed", {
        ...verify,
      });
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };
}

module.exports = Authentication;
