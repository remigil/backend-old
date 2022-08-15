const response = require("../lib/response");
const User = require("../model/user");
const bcrypt = require("bcrypt");
const { JWTVerify } = require("../lib/encryption");

exports.basicAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"]?.replace("Basic ", "");
  const basicAuth = Buffer.from(
    `${process.env.AUTH_UNAME}:${process.env.AUTH_PASSWORD}`
  ).toString("base64");
  if (authHeader === basicAuth) {
    next();
  } else {
    response(res, false, "Not Authorized", null, 401);
  }
};

exports.jwtAuth = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const verify = JWTVerify(authHeader);
  if (authHeader && verify.success) {
    req.auth = verify.data;
    next();
  } else {
    response(res, false, "Not Authorized", null, 401);
  }
};
