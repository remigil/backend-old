const response = require("../lib/response");
const Users = require("../model/user");
const bcrypt = require("bcrypt");
const { JWTEncrypt } = require("../lib/encryption");

class Authentication {
  static login = async (req, res) => {
    const user = await Users.findOne({
      where: {
        username: req.body.username,
        status_verifikasi: 1,
      },
    });
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        const accessToken = JWTEncrypt(
          JSON.stringify({
            uid: user.id,
          })
        );
        return response(res, true, "Login succeed", {
          accessToken,
        });
      }
    }
    response(res, false, "Login failed, please try again!", null, 401);
  };
}

module.exports = Authentication;
