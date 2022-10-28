const response = require("../lib/response");
const User = require("../model/user");
const bcrypt = require("bcrypt");
const { JWTEncrypt, JWTVerify, AESDecrypt } = require("../lib/encryption");
const moment = require("moment");
const TokenTrackNotif = require("../model/token_track_notif");
const Officer = require("../model/officer");
const Account = require("../model/account");
const fs = require("fs");
const { default: readXlsxFile } = require("read-excel-file/node");
const { replace } = require("lodash");
const ReportLogin = require("../model/reportLogin");

module.exports = class Anev {
  static daily = (req, res) => {
    moment.locale("id");
    const date = moment().format("LL");
    return res.render("template/daily", { date });
  };
};
