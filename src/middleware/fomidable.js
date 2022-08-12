const formidable = require("formidable");
const response = require("../lib/response");
module.exports = (req, res, next) => {
  const form = formidable();
  form.parse(req, (err, fields, files) => {
    req.body = { ...fields, ...files };
    if (!err) {
      next();
    } else {
      response(res, false, "Input not valid", err, 500);
    }
  });
};
