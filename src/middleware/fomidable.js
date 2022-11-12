const formidable = require("formidable");
const response = require("../lib/response");
const imageExt = ["png", "jpg", "jpeg", "xls", "xlsx", "csv", "pdf"];
module.exports = (req, res, next) => {
  const form = formidable();
  form.parse(req, (err, fields, files) => {
    let validateFile = [];
    if (files) {
      Object.keys(files).forEach((datanya) => {
        let dataAsset = files[datanya].originalFilename.split(".");
        if (
          imageExt.filter(
            (datanya) =>
              datanya == dataAsset[dataAsset.length - 1].toLowerCase()
          ).length == 0
        ) {
          validateFile.push(dataAsset[dataAsset.length - 1].toLowerCase());
        }
      });
    }
    if (validateFile.length > 0) {
      response(res, false, "File forbiden upload", err, 500);
    } else {
      req.body = { ...fields, ...files };
      if (!err) {
        next();
      } else {
        response(res, false, "Input not valid", err, 500);
      }
    }
  });
};
