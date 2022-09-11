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
  choose_rute: null,
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
      } = req.query;
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
      Renpam.create(fieldValue, {
        transaction: transaction,
      })
        .then((op) => {
          if (
            fieldValue["accounts"].length > 0 ||
            fieldValue["accounts"].length != null
          ) {
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

          if (
            fieldValue["vips"].length > 0 ||
            fieldValue["vips"].length != null
          ) {
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
