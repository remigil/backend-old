const db = require("../config/database");
const response = require("../lib/response");
const Renpam = require("../model/renpam");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const fs = require("fs");
const Schedule = require("../model/schedule");
const Account = require("../model/account");
const Vip = require("../model/vip");
const RenpamAccount = require("../model/renpam_account");
const RenpamVip = require("../model/renpam_vip");
const pagination = require("../lib/pagination-parser");
const direction_route = require("../middleware/direction_route");
const Officer = require("../model/officer");

Renpam.hasOne(Schedule, {
  foreignKey: "id", // replaces `productId`
  sourceKey: "schedule_id",
});
const fieldData = {
  operation_id: null,
  schedule_id: null,
  name_renpam: null,
  type_renpam: null,
  title_start: null,
  title_end: null,
  route: null,
  route_alternatif_1: null,
  route_alternatif_2: null,
  coordinate_guarding: null,
  coordinate_renpam: null,
  date: null,
  start_time: null,
  end_time: null,
  vips: null,
  accounts: null,
  status_renpam: 0,
  choose_rute: 0,
  note_kakor: null,
};

module.exports = class RenpamController {
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
      // return response(res, false, "Failed", start_date);
      const modelAttr = Object.keys(Renpam.getAttributes());
      let getDataRules = { where: null };
      if (serverSide?.toLowerCase() === "true") {
        const resPage = pagination.getPagination(length, start);
        getDataRules.limit = resPage.limit;
        getDataRules.offset = resPage.offset;
      }
      // getDataRules.order = [[modelAttr[order], orderDirection.toUpperCase()]];
      getDataRules.order = [
        [
          order != null ? order : "id",
          orderDirection != null ? orderDirection : "asc",
        ],
      ];

      let date_ob = new Date();
      if (start_date != null && end_date != null) {
        // console.log("tgl");
        getDataRules.where = {
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
        getDataRules.where = {
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
        getDataRules.where = {
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
      const data = await Renpam.findAll({
        ...getDataRules,
        include: [
          {
            model: Schedule,
            foreignKey: "schedule_id",
            required: false,
          },
          {
            model: Account,
            as: "accounts",
            required: false,
          },
          {
            model: Vip,
            as: "vips",
            required: false,
          },
        ],
      });
      const count = await Renpam.count({
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
      const data = await Renpam.findOne({
        where: {
          id: AESDecrypt(req.params.id, {
            isSafeUrl: true,
            parseMode: "string",
          }),
        },
        include: [
          {
            model: Schedule,
            foreignKey: "schedule_id",
            required: false,
          },
          {
            model: Account,
            as: "accounts",
            required: false,
          },
          {
            model: Vip,
            as: "vips",
            required: false,
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

  static listInstruksi = async (req, res) => {
    try {
      // console.log(
      //   AESDecrypt(req.auth.officer, {
      //     isSafeUrl: true,
      //     parseMode: "string",
      //   })
      // );
      let { limit, page } = req.query;
      page = page ? parseInt(page) : 1;
      const resPage = pagination.getPagination(limit, page);
      let renpamData = await Renpam.findAndCountAll({
        include: [
          {
            model: Schedule,
            foreignKey: "schedule_id",
            required: false,
          },
          {
            model: Account,
            as: "accounts",
            required: true,
            include: [
              {
                model: Officer,
                as: "officers",
                where: {
                  id: AESDecrypt(req.auth.officer, {
                    isSafeUrl: true,
                    parseMode: "string",
                  }),
                },
              },
            ],
            // where:{

            // }
          },
          {
            model: Vip,
            as: "vips",
            required: false,
          },
        ],
        // raw: true,
        // nest: true,
        order: [["date", "DESC"]],
        distinct: true,
        limit: resPage.limit,
        offset: resPage.offset,
      });
      let mapDataWithDate = renpamData;
      response(res, true, "Succeed", {
        limit: resPage.limit,
        page: page,
        total: renpamData.count,
        total_page: renpamData.rows.length,
        ...renpamData,
      });
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };

  static add = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let fieldValue = {};
      let fieldValueVip = {};
      let fieldValueAccount = {};
      Object.keys(fieldData).forEach((val, key) => {
        if (req.body[val]) {
          if (val == "operation_id" || val == "schedule_id") {
            fieldValue[val] = AESDecrypt(req.body[val], {
              isSafeUrl: true,
              parseMode: "string",
            });
          } else if (
            val == "route" ||
            val == "vips" ||
            val == "accounts" ||
            val == "route_alternatif_1" ||
            val == "route_alternatif_2" ||
            val == "coordinate_guarding"
          ) {
            fieldValue[val] = JSON.parse(req.body[val]);
          } else {
            fieldValue[val] = req.body[val];
          }
        }
      });
      if (req.body.route) {
        let test = await direction_route(JSON.parse(req.body.route));

        fieldValue["direction_route"] = test.route;
        fieldValue["estimasi"] = test.estimasi;
        fieldValue["estimasi_time"] = test.estimasiWaktu;
      }
      if (req.body.route_alternatif_1) {
        let routeAlter1 = await direction_route(
          JSON.parse(req.body.route_alternatif_1)
        );
        fieldValue["direction_route_alter1"] = routeAlter1.route;
        fieldValue["estimasi_alter1"] = routeAlter1.estimasi;
        fieldValue["estimasi_time_alter1"] = routeAlter1.estimasiWaktu;
      }
      if (req.body.route_alternatif_2) {
        let routeAlter2 = await direction_route(
          JSON.parse(req.body.route_alternatif_2)
        );
        fieldValue["direction_route_alter2"] = routeAlter2;
        fieldValue["estimasi_alter2"] = routeAlter2.estimasi;
        fieldValue["estimasi_time_alter2"] = routeAlter2.estimasiWaktu;
      }
      Renpam.create(fieldValue, {
        transaction: transaction,
      })
        .then((op) => {
          if (fieldValue["accounts"] && fieldValue["accounts"].length > 0) {
            for (let i = 0; i < fieldValue["accounts"].length; i++) {
              fieldValueAccount = {};
              fieldValueAccount["renpam_id"] = AESDecrypt(op["id"], {
                isSafeUrl: true,
                parseMode: "string",
              });
              fieldValueAccount["account_id"] = AESDecrypt(
                fieldValue["accounts"][i],
                {
                  isSafeUrl: true,
                  parseMode: "string",
                }
              );
              RenpamAccount.create(fieldValueAccount);
            }
          }

          if (fieldValue["vips"] && fieldValue["vips"].length > 0) {
            for (let i = 0; i < fieldValue["vips"].length; i++) {
              fieldValueVip = {};
              fieldValueVip["renpam_id"] = AESDecrypt(op["id"], {
                isSafeUrl: true,
                parseMode: "string",
              });
              fieldValueVip["vip_id"] = AESDecrypt(fieldValue["vips"][i], {
                isSafeUrl: true,
                parseMode: "string",
              });
              RenpamVip.create(fieldValueVip);
            }
          }

          transaction.commit();
          response(res, true, "Succeed", fieldValueVip);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };
  static edit = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let fieldValue = {};
      let fieldValueVip = {};
      let fieldValueAccount = {};
      Object.keys(fieldData).forEach((val, key) => {
        if (req.body[val]) {
          if (val == "operation_id" || val == "schedule_id") {
            fieldValue[val] = AESDecrypt(req.body[val], {
              isSafeUrl: true,
              parseMode: "string",
            });
          } else if (
            val == "route" ||
            val == "vips" ||
            val == "accounts" ||
            val == "route_alternatif_1" ||
            val == "route_alternatif_2" ||
            val == "coordinate_guarding"
          ) {
            fieldValue[val] = JSON.parse(req.body[val]);
          } else {
            fieldValue[val] = req.body[val];
          }
        }
      });

      const dataRenAc = RenpamAccount.findOne({
        where: {
          renpam_id: AESDecrypt(req.params.id, {
            isSafeUrl: true,
            parseMode: "string",
          }),
        },
      });
      const dataRenVip = RenpamAccount.findOne({
        where: {
          renpam_id: AESDecrypt(req.params.id, {
            isSafeUrl: true,
            parseMode: "string",
          }),
        },
      });

      if (req.body.route) {
        let test = await direction_route(JSON.parse(req.body.route));

        fieldValue["direction_route"] = test.route;
        fieldValue["estimasi"] = test.estimasi;
        fieldValue["estimasi_time"] = test.estimasiWaktu;
      }
      if (req.body.route_alternatif_1) {
        let routeAlter1 = await direction_route(
          JSON.parse(req.body.route_alternatif_1)
        );
        fieldValue["direction_route_alter1"] = routeAlter1.route;
        fieldValue["estimasi_alter1"] = routeAlter1.estimasi;
        fieldValue["estimasi_time_alter1"] = routeAlter1.estimasiWaktu;
      }
      if (req.body.route_alternatif_2) {
        let routeAlter2 = await direction_route(
          JSON.parse(req.body.route_alternatif_2)
        );
        fieldValue["direction_route_alter2"] = routeAlter2;
        fieldValue["estimasi_alter2"] = routeAlter2.estimasi;
        fieldValue["estimasi_time_alter2"] = routeAlter2.estimasiWaktu;
      }
      // const dataRenpamm = await Renpam.findOne({
      //   where: {
      //     id: AESDecrypt(req.params.id, {
      //       isSafeUrl: true,
      //       parseMode: "string",
      //     }),
      //   },
      // });
      // return response(res, true, "cek aja", fieldValue);

      await Renpam.update(fieldValue, {
        where: {
          id: AESDecrypt(req.params.id, {
            isSafeUrl: true,
            parseMode: "string",
          }),
        },
        transaction: transaction,
      })
        .then((op) => {
          // console.log(fieldValue);
          if (fieldValue["accounts"] && fieldValue["accounts"].length > 0) {
            for (let i = 0; i < fieldValue["accounts"].length; i++) {
              fieldValueAccount = {};
              fieldValueAccount["renpam_id"] = AESDecrypt(req.params.id, {
                isSafeUrl: true,
                parseMode: "string",
              });
              fieldValueAccount["account_id"] = AESDecrypt(
                fieldValue["accounts"][i],
                {
                  isSafeUrl: true,
                  parseMode: "string",
                }
              );

              // if (dataRenAc && dataRenVip) {
              RenpamAccount.destroy({
                where: {
                  renpam_id: fieldValueAccount["renpam_id"],
                },
              });
              RenpamAccount.create(fieldValueAccount);
              // }
            }
          }

          if (fieldValue["vips"] && fieldValue["vips"].length > 0) {
            for (let i = 0; i < fieldValue["vips"].length; i++) {
              fieldValueVip = {};
              fieldValueVip["renpam_id"] = AESDecrypt(req.params.id, {
                isSafeUrl: true,
                parseMode: "string",
              });
              fieldValueVip["vip_id"] = AESDecrypt(fieldValue["vips"][i], {
                isSafeUrl: true,
                parseMode: "string",
              });

              // if (dataRenAc && dataRenVip) {
              RenpamVip.destroy({
                where: {
                  renpam_id: AESDecrypt(req.params.id, {
                    isSafeUrl: true,
                    parseMode: "string",
                  }),
                },
              });
              RenpamVip.create(fieldValueVip);
              // }
            }
          }

          transaction.commit();
          response(res, true, "Succeed", fieldValueVip);
        })
        .catch((err) => {
          console.log({ error: err, message: "ini ereror" });
        });
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };
  static editMobile = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let renpam = await Renpam.update(
        {
          status_renpam: 1,
          end_time: req.body.end_time,
          choose_rute: req.body.choose_rute,
          end_coordinate_renpam: JSON.parse(req.body.end_coordinate_renpam),
        },
        {
          where: {
            id: req.params.id,
          },
          transaction: transaction,
        }
      );
      await transaction.commit();
      response(res, true, "Success", renpam);
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };
  static delete = async (req, res) => {
    const transaction = await db.transaction();
    try {
      await Renpam.destroy({
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
