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
      const { team, nrp_user, device_user } = req.body;
      const account = await Account.findOne({
        where: {
          name_account: team,
        },
        include: [
          {
            model: Officer,
            as: "officer",
            required: true,
            where: {
              nrp_officer: nrp_user,
            },
          },
        ],
      });
      if (account == null) {
        return response(
          res,
          false,
          "Akun Anda Tidak Terdaftar di database kami",
          401
        );
      }

      let chcekDeviceUser = await TokenTrackNotif.findOne({
        where: {
          device_user: device_user,
        },
      });
      let nrpDeviceUser = await TokenTrackNotif.findOne({
        where: {
          nrp_user: nrp_user,
        },
      });

      if (bcrypt.compareSync(req.body.password, account.password)) {
        if (chcekDeviceUser && chcekDeviceUser.nrp_user != nrp_user) {
          return response(
            res,
            false,
            "Data Anda Telah ada di device lainnya, silahkan login menggunakan device sebelumnya"
          );
        } else if (!chcekDeviceUser && !nrpDeviceUser) {
          await TokenTrackNotif.create({
            nrp_user: nrp_user,
            device_user: device_user,
            polda_id: account.officer[0].polda_id,
            team_id: AESDecrypt(account.id, {
              isSafeUrl: true,
              parseMode: "string",
            }),
          });
        }
        const accessToken = JWTEncrypt({
          uid: account.id,
          nrp_user: nrp_user,
          officer: account.officer[0].id,
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
          null,
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
