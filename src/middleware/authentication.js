const response = require("../lib/response");
const Users = require("../model/user");
const bcrypt = require("bcrypt");

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

exports.jwtAuth = async (req, res, next) => {};
