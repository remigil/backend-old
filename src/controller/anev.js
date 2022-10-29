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
const puppeteer = require("puppeteer");
const path = require("path");
module.exports = class Anev {
  static daily = async (req, res) => {
    const { type } = req.query;
    moment.locale("id");
    const date = moment().format("LL");
    switch (type) {
      case "view":
        return res.render("template/daily", { date });

      case "pdf-download":
        const browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", "--disabled-setupid-sandbox"],
          executablePath: process.env.ANEV_CHROME_PATH,
        });
        const page = await browser.newPage();
        await page.goto(
          // `${process.env.ANEV_BASE_URL}/getMonthly?mode=view&month=${month}&year=${year}`,
          `http://localhost:3001/anev-daily?type=view`,
          {
            waitUntil: "networkidle0",
          }
        );
        const pdf = await page.pdf({
          displayHeaderFooter: true,
          headerTemplate: `<div style="width: 100%; font-size: 10px; margin: 0 1cm; color: #bbb; height: 30px; text-align: center;">
          <span class="pageNumber" style="font-size: 10px;"></span>
      </div>`,
          footerTemplate: `
          <div style="width: 100%; font-size: 10px; margin: 0 1cm; color: #bbb; height: 30px; text-align: center;">
          <span class="pageNumber" style="font-size: 10px;"></span>
      </div>
        `,
          printBackground: true,
          format: "A4",
          landscape: false,
          margin: {
            top: "50px",
            right: "0px",
            bottom: "50px",
            left: "0px",
          },
          // scale: 1,
          path: `${path.resolve("./report/anev/monthly.pdf")}`,
        });

        await browser.close();

        res.contentType("application/pdf");
        return res.status(200).send(pdf);

      default: {
        return response(res, false, "Input Not Valid", null, 400);
      }
    }
  };
};
