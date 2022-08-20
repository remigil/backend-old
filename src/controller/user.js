const { AESDecrypt } = require("../lib/encryption");
const response = require("../lib/response");
const User = require("../model/user");
const UserRole = require("../model/user_role");
const db = require("../config/database");
const Account = require("../model/account");
module.exports = class UserController {
  static getLoggedUser = async (req, res) => {
    response(
      res,
      true,
      await User.findOne({
        attributes: {
          exclude: ["role_id"],
        },
        include: {
          model: UserRole,
          attributes: ["id", "name"],
        },
        where: {
          id: AESDecrypt(req.auth.uid, {
            isSafeUrl: true,
            parseMode: "string",
          }),
        },
      })
    );
  };
  static getLoggedUserMobile = async (req, res) => {
    try {
      const idAccount = AESDecrypt(req.auth.uid, {
        isSafeUrl: true,
        parseMode: "string",
      });
      const idOfficer = AESDecrypt(req.auth.officer, {
        isSafeUrl: true,
        parseMode: "string",
      });
      let getProfile = await db
        .query(
          `
        SELECT 
          a.token_fcm,
          a.token_track,
          a.device_user,
          c.name_officer,
          c.photo_officer,
          c.nrp_officer,
          c.rank_officer,
          c.structural_officer,
          c.pam_officer,
          c.phone_officer,
          c.status_officer,
          b.name_account,
          b.leader_team,
          b.vip,
          b.id_account
        FROM token_track a
        INNER JOIN account b ON a.team_id=b.id
        INNER JOIN officer c ON a.nrp_user=c.nrp_officer
        where team_id=${idAccount} AND c.id=${idOfficer}
      `
        )
        .then(([results, metadata]) => results);
      return response(
        res,
        true,
        "Succeed",
        getProfile.length ? getProfile[0] : null
      );
    } catch (error) {
      response(res, false, "Failed", error.message);
    }
  };
  static add = async (req, res) => {
    const transaction = await db.transaction();
    try {
      await User.create(
        {
          nama: req.body.nama,
          alamat: req.body?.alamat,
          username: req.body?.username,
          status_verifikasi: 0,
          email: req.body?.email,
          role_id: req.body?.role_id,
          password: req.body?.password,
        },
        { transaction: transaction }
      );
      await transaction.commit();
      response(res, true, "Succeed", null);
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };
};
