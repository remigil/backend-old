const db = require("../config/database");
const response = require("../lib/response");
const Blankspot = require("../model/blankspot");
const { Op, Sequelize, where } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");
const Polda = require("../model/polda");
const Polres = require("../model/polres");
const moment = require("moment");
const { codeTS } = require("../middleware/codeBlankspot");
const { decimalToHex } = require("../middleware/decimaltohex");
const pagination = require("../lib/pagination-parser");
const direction_route = require("../middleware/direction_route");

Polda.hasMany(Blankspot, { foreignKey: "polda_id", as: "blankspot" });
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
module.exports = class BlankspotController {
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
      const modelAttr = Object.keys(Blankspot.getAttributes());
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
      const data = await Blankspot.findAll({
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
      const count = await Blankspot.count({
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
      const data = await Blankspot.findOne({
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
            fieldValueData[val] = JSON.parse(req.body[val]);
          } else {
            fieldValueData[val] = req.body[val];
          }
        } else {
          fieldValueData[val] = null;
        }
      });
      if (req.body["polda_id"]) {
        fieldValueData["polda_id"] = AESDecrypt(req.body["polda_id"], {
          isSafeUrl: true,
          parseMode: "string",
        });
      }

      let cekSatpas;
      if (req.body["polres_id"]) {
        fieldValueData["polres_id"] = AESDecrypt(req.body["polres_id"], {
          isSafeUrl: true,
          parseMode: "string",
        });
        cekSatpas = await Polres.findOne({
          where: {
            id: fieldValueData["polres_id"],
          },
        });
      }

      if (req.body.route) {
        let route = await direction_route(JSON.parse(req.body.route));
        fieldValueData["direction_route"] = route.route;
      }
      // fieldValueData["id"] = 180;

      Blankspot.create(fieldValueData, {
        transaction: transaction,
      })
        .then(async (op) => {
          // console.log(op);
          let getid = decAes(op["id"]);
          let test = parseInt(getid);
          let code = codeTS(test);

          let getSatpas = cekSatpas["code_satpas"];

          let nots = `BS/${moment().format("MMYY")}${code}/${getSatpas}`;

          await Blankspot.update(
            { no_ts: nots },
            {
              where: {
                id: getid,
              },
              transaction: transaction,
            }
          );

          await transaction.commit();
          response(res, true, "Succeed", op);
        })
        .catch((err) => {
          // console.log(err);
          response(res, false, "Failed", err);
        });
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
            fieldValueData[val] = JSON.parse(req.body[val]);
          } else {
            fieldValueData[val] = req.body[val];
          }
        } else {
          fieldValueData[val] = null;
        }
      });
      await Blankspot.update(fieldValueData, {
        where: {
          id: AESDecrypt(req.params.id, {
            isSafeUrl: true,
            parseMode: "string",
          }),
        },
        transaction: transaction,
      });
      if (req.body.route) {
        direction_route(JSON.parse(req.body.route))
          .then(async (data) => {
            console.log({ data });
            await Blankspot.update(
              {
                direction_route: data.route,
              },
              {
                where: {
                  id: AESDecrypt(req.params.id, {
                    isSafeUrl: true,
                    parseMode: "string",
                  }),
                },
              }
            );
          })
          .catch((err) => {
            console.log({ err });
          });
      }
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
      await Blankspot.update(fieldValue, {
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
      await Blankspot.destroy({
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

  static get_daily = async (req, res) => {
    try {
      const {
        start_date = null,
        end_date = null,
        filter = null,
        date = null,
        serverSide = null,
        length = null,
        start = null,
        polda_id = null,
        topPolda = null,
        limit = 34,
      } = req.query;
      const getDataRules = {
        group: ["polda.id"],
        attributes: [
          "id",
          "name_polda",
          [Sequelize.fn("count", Sequelize.col("polda_id")), "total"],
        ],
        include: [
          {
            model: Blankspot,
            required: false,
            as: "blankspot",
            attributes: [],
          },
        ],
        nest: true,
        subQuery: false,
      };

      if (date) {
        getDataRules.include[0].where = {
          created_at: date,
        };
      }

      if (filter) {
        getDataRules.include[0].where = {
          created_at: {
            [Op.between]: [start_date, end_date],
          },
        };
      }

      if (polda_id) {
        getDataRules.where = {
          id: decAes(polda_id),
        };
      }

      if (serverSide?.toLowerCase() === "true") {
        getDataRules.limit = length;
        getDataRules.offset = start;
      }

      let finals = await Polda.findAll(getDataRules);
      const count = await Polda.count({
        where: getDataRules?.where,
      });

      let rows = [];

      finals.map((element, index) => {
        rows.push({
          id: element.id,
          name_polda: element.name_polda,
          total: parseInt(element.dataValues.total) || 0,
        });
      });

      if (topPolda) {
        rows.sort((a, b) => b.total - a.total);
        rows = rows.slice(0, limit);
      }
      response(res, true, "Succeed", {
        rows,
        recordsFiltered: count,
        recordsTotal: count,
      });
    } catch (error) {
      response(res, false, "Failed", error.message);
    }
  };

  static get_by_date = async (req, res) => {
    let start_of_month = moment().startOf("years").format("YYYY-MM-DD");
    let end_of_month = moment().endOf("years").format("YYYY-MM-DD");
    try {
      const {
        type = null,
        start_date = null,
        end_date = null,
        filter = null,
        date = null,
        serverSide = null,
        length = null,
        start = null,
        polda_id = null,
        topPolda = null,
      } = req.query;

      var list_day = [];
      var list_month = [];
      var list_year = [];

      for (
        var m = moment(start_date);
        m.isSameOrBefore(end_date);
        m.add(1, "days")
      ) {
        list_day.push(m.format("YYYY-MM-DD"));
      }

      for (
        var m = moment(start_date);
        m.isSameOrBefore(end_date);
        m.add(1, "month")
      ) {
        list_month.push(m.format("MMMM"));
      }

      for (
        var m = moment(start_date);
        m.isSameOrBefore(end_date);
        m.add(1, "year")
      ) {
        list_year.push(m.format("YYYY"));
      }

      let wheres = {};
      if (date) {
        wheres.created_at = date;
      }

      if (filter) {
        wheres.created_at = {
          [Op.between]: [start_date, end_date],
        };
      }

      if (polda_id) {
        wheres.polda_id = decAes(polda_id);
      }

      const getDataRules = {
        attributes: [[Sequelize.fn("count", Sequelize.col("no_ts")), "total"]],
        where: wheres,
      };

      if (type === "day") {
        getDataRules.group = "day";
        getDataRules.attributes.push([
          Sequelize.fn("date_trunc", "day", Sequelize.col("created_at")),
          "day",
        ]);
      } else if (type === "month") {
        getDataRules.group = "month";
        getDataRules.attributes.push([
          Sequelize.fn("date_trunc", "month", Sequelize.col("created_at")),
          "month",
        ]);
      } else if (type === "year") {
        getDataRules.group = "year";
        getDataRules.attributes.push([
          Sequelize.fn("date_trunc", "year", Sequelize.col("created_at")),
          "year",
        ]);
      }

      let rows = await Blankspot.findAll(getDataRules);

      let finals = [];
      if (type === "day") {
        let abc = rows.map((element, index) => {
          return {
            total: parseInt(element.dataValues.total),
            date: moment(element.dataValues.day).format("YYYY-MM-DD"),
          };
        });

        const asd = list_day.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              total: parseInt(data.total),
              date: data.date,
            });
          } else {
            finals.push({
              total: 0,
              date: item,
            });
          }
        });
      } else if (type === "month") {
        let abc = rows.map((element, index) => {
          return {
            total: parseInt(element.dataValues.total),
            date: moment(element.dataValues.month).format("MMMM"),
          };
        });

        const asd = list_month.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              total: parseInt(data.total),
              date: data.date,
            });
          } else {
            finals.push({
              total: 0,
              date: item,
            });
          }
        });
      } else if (type === "year") {
        let abc = rows.map((element, index) => {
          return {
            total: parseInt(element.dataValues.total),
            date: moment(element.dataValues.year).format("YYYY"),
          };
        });

        const asd = list_year.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              total: parseInt(data.total),
              date: data.date,
            });
          } else {
            finals.push({
              total: 0,
              date: item,
            });
          }
        });
      }
      response(res, true, "Succeed", finals);
    } catch (error) {
      response(res, false, "Failed", error.message);
    }
  };

  static get_filter = async (req, res) => {
    try {
      const { start_date, end_date, polda_id } = req.query;
      let finals = await Blankspot.findAll({
        where: {
          created_at: {
            [Op.between]: [start_date, end_date],
          },
        },
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
      response(res, true, "Succeed", finals);
    } catch (error) {
      response(res, false, "Failed", error.message);
    }
  };
};
