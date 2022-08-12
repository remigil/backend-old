const response = require("../lib/response");
const Users = require("../model/user");

module.exports = class UserController {
  static getLoggedUser = async (req, res) => {
    response(
      res,
      true,
      "Success",
      await Users.findOne({
        where: {
          id: req.auth.uid,
        },
      })
    );
  };
};
