const { AESDecrypt, AESEncrypt } = require("../lib/encryption");
const response = require("../lib/response");
const db = require("../config/database");
const fs = require("fs");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const pagination = require("../lib/pagination-parser");
const moment = require("moment");
const prefix = require("../middleware/prefix");
const codeReport = require("../middleware/codeReport");
const Officer = require("../model/officer");
const Panic_button = require("../model/report");
const Account = require("../model/account");
const NotifikasiController = require("./notification");
const notifHandler = require("../middleware/notifHandler");
const TokenTrackNotif = require("../model/token_track_notif");
const DayReport = require("../model/day_report");
const { TrackG20 } = require("../model/tracking/g20");
const { Client } = require("@googlemaps/google-maps-services-js");
const googleMapClient = new Client();
const fieldData = {
  t_officer_registered: 0,
  t_officer_registered_car: 0,
  t_officer_registered_bike: 0,
  t_officer_registered_not_driving: 0,

  t_officer_active: 0,
  t_officer_active_car: 0,
  t_officer_active_bike: 0,
  t_officer_active_not_driving: 0,

  t_report_kriminal: 0,
  t_report_lalu_lintas: 0,
  t_report_kemacetan: 0,
  t_report_bencanaalam: 0,
  t_report_pengaturan: 0,
  t_report_pengawalan: 0,
  t_report_lainnya: 0,

  t_schedule_done: 0,
  t_rengiat_done: 0,
  t_rengiat_failed: 0,
};
module.exports = class ReportController {
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
        orderDirection = "asc",
      } = req.query;
      const modelAttr = Object.keys(DayReport.getAttributes());
      let getData = { where: null };
      if (serverSide?.toLowerCase() === "true") {
        const resPage = pagination.getPagination(length, start);
        getData.limit = resPage.limit;
        getData.offset = resPage.offset;
      }
      // getDataRules.order = [[modelAttr[order], orderDirection.toUpperCase()]];
      getData.order = [
        [
          order != null ? order : "id",
          orderDirection != null ? orderDirection : "desc",
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
        getData.where = {
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
        getData.where = {
          ...getData.where,
          ...filters,
        };
      }
      // getData.include = [
      //   {
      //     model: Officer,
      //   },
      //   {
      //     model: Account,
      //     required: false,
      //   },
      // ];
      const data = await DayReport.findAll(getData);
      const count = await DayReport.count({
        where: getData?.where,
      });

      response(res, true, "Succeed", {
        data: data.map((ee) => ({
          ...ee.dataValues,
          id: AESEncrypt(String(ee.dataValues.id), {
            isSafeUrl: true,
          }),
          categori: codeReport(
            ee.dataValues.categori != null ? ee.dataValues.categori : "999",
            "type"
          ),
        })),
        // data: data,
        recordsFiltered: count,
        recordsTotal: count,
      });
    } catch (e) {
      console.log(e);
      response(res, false, "Failed", e.message);
    }
  };
  static getId = async (req, res) => {
    try {
      const data = await DayReport.findOne({
        where: {
          id: AESDecrypt(req.params.id, {
            isSafeUrl: true,
            parseMode: "string",
          }),
        },
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
      let fieldValue = {};
      const countOfficerRegistered = await Officer.count({
        where: {
          s,
        },
      });
      const countOfficerActive = await Officer.count({
        where: getData?.where,
      });
      // Object.keys(fieldData).forEach((val, key) => {
      //   if (req.body[val]) {
      //     fieldValue[val] = req.body[val];
      //   }
      // });
      // await DayReport.create(fieldValue, { transaction: transaction });
      // await transaction.commit();
      response(res, true, "Succeed", fieldValue);
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };

  static edit = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let fieldValue = {};
      Object.keys(fieldData).forEach((val, key) => {
        if (req.body[val]) {
          fieldValue[val] = req.body[val];
        }
      });

      await DayReport.update(fieldValue, {
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
      await DayReport.destroy({
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
