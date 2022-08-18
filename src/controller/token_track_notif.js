const db = require("../config/database");
const response = require("../lib/response");
const TokenTrackNotif = require("../model/token_track_notif");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const conditionalField = {
  token_fcm: null,
  token_track: null,
};
module.exports = class TokenTrackController {
  static get = async (req, res) => {
    try {
      const {
        length = 10,
        start = 0,
        serverSide = null,
        search = null,
        filter = [],
        filterSearch = [],
        order = 0,
        orderDirection = "asc",
      } = req.query;
      const modelAttr = Object.keys(TokenTrackNotif.getAttributes());
      let getDataRules = { where: null };
      if (serverSide?.toLowerCase() === "true") {
        getDataRules.limit = length;
        getDataRules.offset = start;
      }
      if (order <= modelAttr.length) {
        getDataRules.order = [[modelAttr[order], orderDirection.toUpperCase()]];
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
      const data = await TokenTrackNotif.findAll(getDataRules);
      const count = await TokenTrackNotif.count({
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
  static add = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let getTrack = await TokenTrackNotif.findOne({
        where: {
          nrp_user: req.body?.nrp_user,
        },
      });
      if (getTrack) {
        let objFieldUpdate = {};
        Object.keys(conditionalField).forEach((val, key) => {
          if (
            req.body[val] != null &&
            req.body[val] != "" &&
            req.body[val] != undefined
          ) {
            objFieldUpdate[val] = req.body[val];
          }
        });
        await TokenTrackNotif.update(objFieldUpdate, {
          where: {
            nrp_user: req.body?.nrp_user,
          },
          transaction: transaction,
        });
      } else {
        await TokenTrackNotif.create(
          {
            nrp_user: req.body?.nrp_user,
            user_id: AESDecrypt(req.auth.uid, {
              isSafeUrl: true,
              parseMode: "string",
            }),
            device_user: req.body?.device_user,
          },
          { transaction: transaction }
        );
      }

      await transaction.commit();
      response(res, true, "Succeed", null);
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };
  static edit = async (req, res) => {
    const transaction = await db.transaction();
    try {
      await TokenTrackNotif.update(
        {
          name: req.body?.name,
          description: req.body?.description,
        },
        {
          where: {
            id: AESDecrypt(req.params.id, {
              isSafeUrl: true,
              parseMode: "string",
            }),
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
  // static updateToken = async (req, res) => {
  //   const transaction = await db.transaction();
  //   let objFieldUpdate = {};
  //   Object.keys(conditionalField).forEach((val, key) => {
  //     if (
  //       req.body[val] != null &&
  //       req.body[val] != "" &&
  //       req.body[val] != undefined
  //     ) {
  //       objFieldUpdate[val] = req.body[val];
  //     }
  //   });
  //   try {
  //     await TokenTrackNotif.update(
  //       {
  //         name: req.body?.name,
  //         description: req.body?.description,
  //       },
  //       {
  //         where: {
  //           id: AESDecrypt(req.params.id, {
  //             isSafeUrl: true,
  //             parseMode: "string",
  //           }),
  //         },
  //         transaction: transaction,
  //       }
  //     );
  //     await transaction.commit();
  //     response(res, true, "Succeed", null);
  //   } catch (e) {
  //     await transaction.rollback();
  //     response(res, false, "Failed", e.message);
  //   }
  // };
  static delete = async (req, res) => {
    const transaction = await db.transaction();
    try {
      await TokenTrackNotif.destroy({
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
