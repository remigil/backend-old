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
const Report = require("../model/report");
const Schedule = require("../model/schedule");
const Renpam = require("../model/renpam");
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

  date: null,
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
        start_date = null,
        end_date = null,
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

      let date_ob = new Date();
      if (start_date != null && end_date != null) {
        // console.log("tgl");
        getData.where = {
          date: {
            [Op.between]: [start_date, end_date],
          },
        };
      } else if (start_date == null && end_date != null) {
        var date = (
          "0" + new Date(new Date().setDate(new Date().getDate() - 1)).getDate()
        ).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();

        // var startDate = year + "-" + month + "-" + date;
        // var endDate = year + "-" + month + "-" + date;
        getData.where = {
          date: {
            [Op.between]: [date_ob, end_date],
          },
        };
      } else if (start_date != null && end_date == null) {
        var date = (
          "0" + new Date(new Date().setDate(new Date().getDate() - 1)).getDate()
        ).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();

        // var startDate = year + "-" + month + "-" + date;
        // var endDate = year + "-" + month + "-" + date;
        getData.where = {
          date: {
            [Op.between]: [start_date, date_ob],
          },
        };
      }

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
        data: data,
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
      var starDate = moment().startOf("day").toDate();
      var endDate = moment().endOf("day").toDate();

      const countOfficerRegisteredAll = await Officer.count({
        where: {
          created_at: {
            [Op.between]: [
              moment().startOf("year"),
              moment().subtract(1, "days").endOf("day").toDate(),
            ],
          },
        },
      });

      const countReportKriminal = await Report.count({
        where: {
          created_at: {
            [Op.between]: [starDate, endDate],
          },
          categori: 1,
        },
      });
      const countReportLaluLintas = await Report.count({
        where: {
          created_at: {
            [Op.between]: [starDate, endDate],
          },
          categori: 2,
        },
      });
      const countReportKemacetan = await Report.count({
        where: {
          created_at: {
            [Op.between]: [starDate, endDate],
          },
          categori: 4,
        },
      });
      const countReportBencanaAlam = await Report.count({
        where: {
          created_at: {
            [Op.between]: [starDate, endDate],
          },
          categori: 3,
        },
      });
      const countReportPengaturan = await Report.count({
        where: {
          created_at: {
            [Op.between]: [starDate, endDate],
          },
          categori: 5,
        },
      });
      const countReportPengawalan = await Report.count({
        where: {
          created_at: {
            [Op.between]: [starDate, endDate],
          },
          categori: 6,
        },
      });
      const countReportLainnya = await Report.count({
        where: {
          created_at: {
            [Op.between]: [starDate, endDate],
          },
          categori: 999,
        },
      });

      const countSchedule = await Schedule.count({
        where: {
          created_at: {
            [Op.between]: [starDate, endDate],
          },
          end_time: {
            [Op.not]: null,
          },
        },
      });

      const countRenpamDone = await Renpam.count({
        where: {
          created_at: {
            [Op.between]: [starDate, endDate],
          },
          end_time: {
            [Op.not]: null,
          },
        },
      });
      const countRenpamFailed = await Renpam.count({
        where: {
          created_at: {
            [Op.between]: [starDate, endDate],
          },
          end_time: {
            [Op.is]: null,
          },
        },
      });

      fieldValue["t_officer_registered"] = 0;
      fieldValue["t_officer_registered_car"] = 0;
      fieldValue["t_officer_registered_bike"] = 0;
      fieldValue["t_officer_registered_not_driving"] = 0;

      fieldValue["t_officer_active"] = 0;
      fieldValue["t_officer_active_car"] = 0;
      fieldValue["t_officer_active_bike"] = 0;
      fieldValue["t_officer_active_not_driving"] = 0;

      fieldValue["t_report_kriminal"] = countReportKriminal;
      fieldValue["t_report_lalu_lintas"] = countReportLaluLintas;
      fieldValue["t_report_kemacetan"] = countReportKemacetan;
      fieldValue["t_report_bencanaalam"] = countReportBencanaAlam;
      fieldValue["t_report_pengaturan"] = countReportPengaturan;
      fieldValue["t_report_pengawalan"] = countReportPengawalan;
      fieldValue["t_report_lainnya"] = countReportLainnya;

      fieldValue["t_schedule_done"] = countSchedule;
      fieldValue["t_rengiat_done"] = countRenpamDone;
      fieldValue["t_rengiat_failed"] = countRenpamFailed;

      const cekDataReportDay = await DayReport.findOne({
        where: {
          created_at: {
            [Op.between]: [starDate, endDate],
          },
        },
      });

      if (!cekDataReportDay) {
        await DayReport.create(fieldValue, { transaction: transaction });
        // console.log("ga ada data");
      } else {
        await DayReport.update(fieldValue, {
          where: {
            id: AESDecrypt(cekDataReportDay["id"], {
              isSafeUrl: true,
              parseMode: "string",
            }),
          },
          transaction: transaction,
        });
        // console.log(`${cekDataReportDay["id"]}`);
      }

      await transaction.commit();
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
