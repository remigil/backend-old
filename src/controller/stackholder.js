const db = require("../config/database");
const response = require("../lib/response");
const Stackholder = require("../model/stackholder");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");
const pagination = require("../lib/pagination-parser");

module.exports = class StackController {
  static get = async (req, res) => {
    try {
      let data = await Stackholder.findAll();

      response(res, true, "Succeed", data);
    } catch (error) {
      response(res, false, "Failed", e.message);
    }
  };
};
