const { AESDecrypt } = require("../lib/encryption");
const response = require("../lib/response");
const ReportLogin = require("../model/reportLogin");
const db = require("../config/database");
const fs = require("fs");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const formidable = require("formidable");
const { Client } = require("@googlemaps/google-maps-services-js");
const pagination = require("../lib/pagination-parser");
const moment = require("moment");
const { TrackG20 } = require("../model/tracking/g20");
const fieldData = {
  nrp_user: null,
  login_time: null,
  logout_time: null,
};
module.exports = class ReportLoginController {
  //   static get = async (req, res) => {
  //     try {
  //       const {
  //         length = 10,
  //         start = 0,
  //         serverSide = null,
  //         search = null,
  //         filter = [],
  //         filterSearch = [],
  //         order = null,
  //         orderDirection = "asc",
  //       } = req.query;
  //       const modelAttr = Object.keys(ReportLogin.getAttributes());
  //       let getData = { where: null };
  //       if (serverSide?.toLowerCase() === "true") {
  //         const resPage = pagination.getPagination(length, start);
  //         getData.limit = resPage.limit;
  //         getData.offset = resPage.offset;
  //       }
  //       getData.order = [
  //         [
  //           order != null ? order : "id",
  //           orderDirection != null ? orderDirection : "asc",
  //         ],
  //       ];
  //       if (search != null) {
  //         let whereBuilder = [];
  //         modelAttr.forEach((key) => {
  //           whereBuilder.push(
  //             Sequelize.where(
  //               Sequelize.fn(
  //                 "lower",
  //                 Sequelize.cast(Sequelize.col(key), "varchar")
  //               ),
  //               {
  //                 [Op.like]: `%${search.toLowerCase()}%`,
  //               }
  //             )
  //           );
  //         });
  //         getData.where = {
  //           [Op.or]: whereBuilder,
  //         };
  //       }
  //       getData.where = {
  //         deleted_at: {
  //           [Op.is]: null,
  //         },
  //       };
  //       if (
  //         filter != null &&
  //         filter.length > 0 &&
  //         filterSearch != null &&
  //         filterSearch.length > 0
  //       ) {
  //         const filters = [];
  //         filter.forEach((fKey, index) => {
  //           if (_.includes(modelAttr, fKey)) {
  //             filters[fKey] = filterSearch[index];
  //           }
  //         });
  //         getData.where = {
  //           ...getData.where,
  //           ...filters,
  //         };
  //       }
  //       const data = await ReportLogin.findAll(getData);
  //       const count = await ReportLogin.count({
  //         where: getData?.where,
  //       });
  //       response(res, true, "Succeed", {
  //         data,
  //         recordsFiltered: count,
  //         recordsTotal: count,
  //       });
  //     } catch (e) {
  //       response(res, false, "Failed", e.message);
  //     }
  //   };
  static login = async (req, res) => {
    const transaction = await db.transaction();
    try {
      const { nrp_user } = req.body;
      let op = await ReportLogin.create(
        {
          nrp_user,
          login_time: moment(),
        },
        {
          transaction: transaction,
        }
      );
      await transaction.commit();
      response(res, true, "Succeed", op);
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };
  static logout = async (req, res) => {
    const transaction = await db.transaction();
    try {
      const { nrp_user } = req.body;
      // let op = await ReportLogin.update(
      //   {
      //     nrp_user,
      //     logout_time: moment(),
      //   },
      //   {
      //     where: {
      //       nrp_user,
      //       logout_time: null,
      //     },
      //   },
      //   {
      //     transaction: transaction,
      //   }
      // );
      // await transaction.commit();
      // response(res, true, "Succeed", op);
      const getTrack = await TrackG20.findOne(
        {
          nrp_user,
        },
        null,
        {
          sort: {
            created_at: -1,
          },
        }
      );
      response(res, true, "Succeed", getTrack);
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };
  static add = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let fieldValueData = {};
      Object.keys(fieldData).forEach((key) => {
        if (req.body[key]) {
          if (key == "login_time" || key == "logout_time") {
            fieldValueData[key] = moment().format("YYYY-MM-DD HH:MM:SS Z");
          } else {
            fieldValueData[key] = req.body[key];
          }
        } else {
          fieldValueData[key] = null;
        }
      });

      let op = await ReportLogin.create(fieldValueData, {
        transaction: transaction,
      });
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
      const { id } = req.params;

      const getReport = await ReportLogin.findOne({
        where: {
          nrp_user: id,
          logout_time: null,
        },
        order: [["login_time", "desc"]],
      });
      await ReportLogin.update(
        {
          logout_time: new Date(),
        },
        {
          where: {
            id: getReport.id,
          },
          transaction: transaction,
        }
      );
      await transaction.commit();

      response(res, true, "Succeed", null);
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };
};
