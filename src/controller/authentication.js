const response = require("../lib/response");
const User = require("../model/user");
const bcrypt = require("bcrypt");
const { JWTEncrypt, JWTVerify, AESDecrypt } = require("../lib/encryption");
const moment = require("moment");
const TokenTrackNotif = require("../model/token_track_notif");
const Officer = require("../model/officer");

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
    const team = await Officer.findOne({
      where: {
        team: req.body.team,
      },
    });

    const officer = await Officer.findOne({
      where: {
        nrp_user: req.body.team,
      },
    });

    if (!officer) {
      return response(res, false, "Akun Anda Tidak Terdaftar di database kami");
    }

    let nrp_user = await TokenTrackNotif.findOne({
      where: {
        nrp_user: officer.nrp_user,
        user_id: AESDecrypt(team.id, {
          isSafeUrl: true,
          parseMode: "string",
        }),
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
          nrp_user: officer.nrp_user,
          device_user: req.body.device_user,
          team_id: AESDecrypt(team.id, {
            isSafeUrl: true,
            parseMode: "string",
          }),
        })
      ).dataValues;
    }
    if (team) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        const accessToken = JWTEncrypt({
          uid: team.id,
          nrp_user: nrp_user.id,
          timestamp: moment().unix(),
        });
        return response(res, true, "Login succeed", {
          accessToken,
        });
      }
    }
    response(res, false, "Login failed, please try again!", null, 401);
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
