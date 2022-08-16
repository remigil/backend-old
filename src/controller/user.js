const { AESDecrypt } = require("../lib/encryption");
const response = require("../lib/response");
const User = require("../model/user");
const UserRole = require("../model/user_role");
const db = require("../config/database");
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
