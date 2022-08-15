const { AESDecrypt } = require("../lib/encryption");
const response = require("../lib/response");
const User = require("../model/user");
const UserRole = require("../model/user_role");

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
};
