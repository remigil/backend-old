const db = require("../config/database");
const response = require("../lib/response");
const Troublespot = require("../model/troublespot");
const { Op, Sequelize, where } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");
const Polda = require("../model/polda");
const Polres = require("../model/polres");
const moment = require("moment");
const { codeTS } = require("../middleware/codeTroublespot");
const { decimalToHex } = require("../middleware/decimaltohex");
const pagination = require("../lib/pagination-parser");
const direction_route = require("../middleware/direction_route");

const decAes = (token) =>
  AESDecrypt(token, {
    isSafeUrl: true,
    parseMode: "string",
  });

const fieldData = {
  no_ts: null,
  report_date: null,
  reporter_name: null,
  polda_id: null,
  polres_id: null,
  traffic_reason: null,
  location: null,
  latitude: null,
  longitude: null,
  desc: null,
  problem: null,
  recommendation: null,
  action: null,
  result: null,
  route: null,
};
module.exports = class TroublespotController {
  static get = async (req, res) => {
    try {
      const {
        length = 10,
        start = 0,
        serverSide = null,
        search = null,
        filter = [],
        filterSearch = [],
        order = null,
        orderDirection = "desc",
      } = req.query;
      const modelAttr = Object.keys(Troublespot.getAttributes());
      let getDataRules = { where: null };
      if (serverSide?.toLowerCase() === "true") {
        const resPage = pagination.getPagination(length, start);
        getDataRules.limit = resPage.limit;
        getDataRules.offset = resPage.offset;
      }
      getDataRules.order = [
        [
          order != null ? order : "id",
          orderDirection != null ? orderDirection : "asc",
        ],
      ];
      if (search != null) {
        let whereBuilder = [];
        modelAttr.forEach((key) => {
          whereBuilder.push(
            Sequelize.where(
              Sequelize.fn(
                "lower",
                Sequelize.cast(Sequelize.col(key), "varchar")
              ),
              {
                [Op.like]: `%${search.toLowerCase()}%`,
              }
            )
          );
        });
        getDataRules.where = {
          [Op.or]: whereBuilder,
        };
      }
      if (
        filter != null &&
        filter.length > 0 &&
        filterSearch != null &&
        filterSearch.length > 0
      ) {
        const filters = [];
        filter.forEach((fKey, index) => {
          if (_.includes(modelAttr, fKey)) {
            filters[fKey] = filterSearch[index];
          }
        });
        getDataRules.where = {
          ...getDataRules.where,
          ...filters,
        };
      }
      const data = await Troublespot.findAll({
        ...getDataRules,
        include: [
          {
            model: Polda,
            attributes: ["id", "name_polda"],
          },
          {
            model: Polres,
            attributes: ["id", "name_polres"],
          },
        ],
      });
      const count = await Troublespot.count({
        where: getDataRules?.where,
      });
      response(res, true, "Succeed", {
        data,
        recordsFiltered: count,
        recordsTotal: count,
      });
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };
  static getId = async (req, res) => {
    try {
      const data = await Troublespot.findOne({
        where: {
          id: AESDecrypt(req.params.id, {
            isSafeUrl: true,
            parseMode: "string",
          }),
        },
        include: [
          {
            model: Polda,
            attributes: ["name_polda"],
          },
          {
            model: Polres,
            attributes: ["name_polres"],
          },
        ],
      });
      response(res, true, "Succeed", {
        data,
      });
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };

  static add = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let fieldValueData = {};
      Object.keys(fieldData).forEach((val, key) => {
        if (req.body[val]) {
          if (val == "route") {
            let route = await direction_route(
              JSON.parse(req.body[val])
            );
            // fieldValue["direction_route_alter2"] = routeAlter2.route;
            fieldValueData[val] = route;
          } else {
            fieldValueData[val] = req.body[val];
          }
        } else {
          fieldValueData[val] = null;
        }
      });
      fieldValueData["polda_id"] = AESDecrypt(req.body["polda_id"], {
        isSafeUrl: true,
        parseMode: "string",
      });
      fieldValueData["polres_id"] = AESDecrypt(req.body["polres_id"], {
        isSafeUrl: true,
        parseMode: "string",
      });

      let cekSatpas = await Polres.findOne({
        where: {
          id: fieldValueData["polres_id"],
        },
      });

      // let cekNoTs = await Troublespot.findAll({
      //   limit: 1,
      //   order: [["id", "DESC"]],
      // });

      // let insertGetTs = decAes(cekNoTs[0].id);
      // let test = parseInt(insertGetTs) + 1;
      // let code = codeTS(test);

      // let getSatpas = cekSatpas["code_satpas"];

      // fieldValueData["no_ts"] = no_ts;

      let op = await Troublespot.create(fieldValueData, {
        transaction: transaction,
      });
      let getid = decAes(op["id"]);
      let test = parseInt(getid);
      let code = codeTS(test);

      let getSatpas = cekSatpas["code_satpas"];

      let nots = `TS/${moment().format("MMYY")}${code}/${getSatpas}`;

      await Troublespot.update(
        { no_ts: nots },
        {
          where: {
            id: getid,
          },
          transaction: transaction,
        }
      );

      // await Trip_on.update(
      //   { code: codetrp, barcode: barcode },
      //   {
      //     where: {
      //       id: getId,
      //     },
      //     transaction: transaction,
      //   }
      // );
      await transaction.commit();
      response(res, true, "Succeed", op);
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };

  static edit = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let fieldValueData = {};
      Object.keys(fieldData).forEach((val, key) => {
        if (req.body[val]) {
          if (val == "route") {
            let route = await direction_route(
              JSON.parse(req.body[val])
            );
            fieldValueData[val] = route;
          } else {
            fieldValueData[val] = req.body[val];
          }
        } else {
          fieldValueData[val] = null;
        }
      });
      await Troublespot.update(fieldValueData, {
        where: {
          id: AESDecrypt(req.params.id, {
            isSafeUrl: true,
            parseMode: "string",
          }),
        },
        transaction: transaction,
      });
      await transaction.commit();
      response(res, true, "Succeed", null);
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };

  static delete = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let fieldValue = {};
      fieldValue["deleted_at"] = new Date();
      await Troublespot.update(fieldValue, {
        where: {
          id: AESDecrypt(req.body.id, {
            isSafeUrl: true,
            parseMode: "string",
          }),
        },
        transaction: transaction,
      });
      await transaction.commit();
      response(res, true, "Succeed", null);
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };

  static hardDelete = async (req, res) => {
    const transaction = await db.transaction();
    try {
      await Troublespot.destroy({
        where: {
          id: AESDecrypt(req.body.id, {
            isSafeUrl: true,
            parseMode: "string",
          }),
        },
        transaction: transaction,
      });
      await transaction.commit();
      response(res, true, "Succeed", null);
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };
};
