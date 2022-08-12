const { validationResult, body } = require("express-validator");
const response = require("../lib/response");
module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let msg = "";
    Object.keys(errors.mapped()).forEach((k, i) => {
      msg += `${i > 0 ? ", " : ""}${k.toUpperCase()}:${errors.mapped()[k].msg}`;
    });
    return response(res, false, msg, errors.mapped(), 400);
  }
  next();
};
