const db = require("../config/database");
const response = require("../lib/response");
const Account = require("../model/account");
const Vehicle = require("../model/vehicle");
const Vip = require("../model/vip");
const Polres = require("../model/polres");
const AccountProfile = require("../model/trx_account_officer");

const { Op, Sequelize } = require("sequelize");
const { AESDecrypt } = require("../lib/encryption");
const Officer = require("../model/officer");
const pagination = require("../lib/pagination-parser");
const TrxAccountOfficer = require("../model/trx_account_officer");

const field_account = {
  name_account: null,

  leader_team: null,
  id_vehicle: null,
  id_account: null,
  officers: null,
  vehicles: null,
  password: null,
};

// AccountProfile.hasOne(Vehicle, {
//   foreignKey: "vehicle_id", // replaces `productId`
//   sourceKey: "id",
// });
module.exports = class AccountController {
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
      const modelAttr = Object.keys(Account.getAttributes());
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
      const count = await Account.count({
        where: getDataRules?.where,
      });
      const data = await Account.findAll({
        ...getDataRules,
        include: [
          {
            model: Vehicle,
            as: "vehicle",
            foreignKey: "id_vehicle",
            required: false,
          },
          {
            model: Officer,

            foreignKey: "leader_team",
            required: false,
          },
          {
            model: Officer,
            as: "officers",
            required: false,
          },
          {
            model: Vehicle,
            as: "vehicles",
            required: false,
          },
        ],
        subQuery: true,
      });

      response(res, true, "Succeed", {
        data,
        recordsFiltered: count,
        recordsTotal: count,
      });
    } catch (e) {
      console.log(e);
      response(res, false, "Failed", e.message);
    }
  };
  static getOfficerAccount = async (req, res) => {
    try {
      const idOfficer = AESDecrypt(req.auth.officer, {
        isSafeUrl: true,
        parseMode: "string",
      });
      let account_id = await TrxAccountOfficer.findOne({
        where: {
          officer_id: parseInt(idOfficer),
        },
      });
      let dataAccount = await Account.findOne({
        where: {
          id: account_id.account_id,
        },
        include: [
          {
            model: Officer,
            as: "officers",
            required: true,
          },
        ],
      });
      response(res, true, "Succeed", dataAccount.officers);
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };
  static getOfficerAccountById = async (req, res) => {
    try {
      // const idOfficer = AESDecrypt(req.auth.officer, {
      //   isSafeUrl: true,
      //   parseMode: "string",
      // });
      console.log({ id: req });
      let account_id = await TrxAccountOfficer.findOne({
        where: {
          officer_id: parseInt(req.query.id),
        },
      });
      let dataAccount = await Account.findOne({
        where: {
          id: account_id.account_id,
        },
        include: [
          {
            model: Officer,
            as: "officers",
            required: true,
          },
        ],
      });
      response(res, true, "Succeed", dataAccount.officers);
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };
  static getId = async (req, res) => {
    try {
      const data = await Account.findOne({
        include: [
          {
            model: Vehicle,
            as: "vehicle",
            foreignKey: "id_vehicle",
            required: false,
          },
          {
            model: Officer,
            // as: "leader",
            foreignKey: "leader_team",
            required: false,
          },
          {
            model: Officer,
            as: "officers",
            required: false,
          },
          {
            model: Vehicle,
            as: "vehicles",
            required: false,
          },
        ],
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
      const findAccount = await Account.findOne({
        where: {
          name_account: req.body["name_account"],
        },
      });
      if (findAccount) {
        response(res, false, "Accound sudah ada", null);
      } else {
        let fieldValue = {};
        let fieldValueOfficer = {};
        Object.keys(field_account).forEach((val, key) => {
          if (req.body[val]) {
            if (val == "id_vehicle" || val == "leader_team") {
              fieldValue[val] = AESDecrypt(req.body[val], {
                isSafeUrl: true,
                parseMode: "string",
              });
            } else if (val == "officers" || val == "vehicles") {
              fieldValue[val] = JSON.parse(req.body[val]);
            } else {
              fieldValue[val] = req.body[val];
            }
          }
        });
        const createAccount = await Account.create(fieldValue, {
          transaction: transaction,
        });
        if (createAccount) {
          if (
            fieldValue["officers"] ||
            fieldValue["officers"].length > 0 ||
            fieldValue["officers"].length != null
          ) {
            for (let i = 0; i < fieldValue["officers"].length; i++) {
              fieldValueOfficer = {};
              fieldValueOfficer["account_id"] = AESDecrypt(
                createAccount["id"],
                {
                  isSafeUrl: true,
                  parseMode: "string",
                }
              );
              fieldValueOfficer["officer_id"] = AESDecrypt(
                fieldValue["officers"][i],
                {
                  isSafeUrl: true,
                  parseMode: "string",
                }
              );
              if (fieldValue["vehicles"] || fieldValue["vehicles"].length > 0) {
                fieldValueOfficer["vehicle_id"] = AESDecrypt(
                  fieldValue["vehicles"][i],
                  {
                    isSafeUrl: true,
                    parseMode: "string",
                  }
                );
              }
              await AccountProfile.create(fieldValueOfficer, { transaction });
            }
          }
        }
        await transaction.commit();
        response(res, true, "Succeed", null);
      }
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };
  static edit = async (req, res) => {
    const transaction = await db.transaction();
    try {
      // let fieldValue = {};
      // Object.keys(field_account).forEach((val, key) => {
      //   if (req.body[val]) {
      //     if (val == "polres_id" || val == "id_vehicle" || val == "id_vip") {
      //       fieldValue[val] = AESDecrypt(req.body[val], {
      //         isSafeUrl: true,
      //         parseMode: "string",
      //       });
      //     } else {
      //       fieldValue[val] = req.body[val];
      //     }
      //   }
      // });

      // await Account.update(fieldValue, {
      //   where: {
      //     id: AESDecrypt(req.params.id, {
      //       isSafeUrl: true,
      //       parseMode: "string",
      //     }),
      //   },
      //   transaction: transaction,
      // });
      // await transaction.commit();
      // response(res, true, "Succeed", null);

      let fieldValue = {};
      let fieldValueOfficer = {};
      Object.keys(field_account).forEach((val, key) => {
        if (req.body[val]) {
          if (val == "id_vehicle" || val == "leader_team") {
            fieldValue[val] = AESDecrypt(req.body[val], {
              isSafeUrl: true,
              parseMode: "string",
            });
          } else if (val == "officers" || val == "vehicles") {
            fieldValue[val] = JSON.parse(req.body[val]);
          } else {
            fieldValue[val] = req.body[val];
          }
        }
      });

      await Account.update(
        fieldValue,
        {
          where: {
            id: AESDecrypt(req.params.id, {
              isSafeUrl: true,
              parseMode: "string",
            }),
          },
        },
        {
          transaction,
        }
      )
        .then(async (op) => {
          if (fieldValue["officers"] || fieldValue["officers"].length > 0) {
            for (let i = 0; i < fieldValue["officers"].length; i++) {
              var officer_id = AESDecrypt(fieldValue["officers"][i], {
                isSafeUrl: true,
                parseMode: "string",
              });
              // return response(res, true, "Succeed", officer_id);

              AccountProfile.destroy({
                where: {
                  account_id: AESDecrypt(req.params.id, {
                    isSafeUrl: true,
                    parseMode: "string",
                  }),
                  officer_id: officer_id,
                },
              })
                .then(async (op) => {
                  fieldValueOfficer = {};
                  fieldValueOfficer["account_id"] = AESDecrypt(req.params.id, {
                    isSafeUrl: true,
                    parseMode: "string",
                  });
                  fieldValueOfficer["officer_id"] = AESDecrypt(
                    fieldValue["officers"][i],
                    {
                      isSafeUrl: true,
                      parseMode: "string",
                    }
                  );

                  if (
                    fieldValue["vehicles"] ||
                    fieldValue["vehicles"].length > 0
                  ) {
                    fieldValueOfficer["vehicle_id"] = AESDecrypt(
                      fieldValue["vehicles"][i],
                      {
                        isSafeUrl: true,
                        parseMode: "string",
                      }
                    );
                  }
                  await AccountProfile.create(fieldValueOfficer, {
                    transaction,
                  });
                })
                .catch((err) => {
                  console.log(err);
                });
            }

            await transaction.commit();
            response(res, true, "Succeed", null);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };
  static delete = async (req, res) => {
    const transaction = await db.transaction();
    try {
      await Account.destroy(
        {
          where: {
            id: AESDecrypt(req.body.id, {
              isSafeUrl: true,
              parseMode: "string",
            }),
          },
        },
        {
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
