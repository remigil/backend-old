const db = require("../config/database");
const response = require("../lib/response");
const Account = require("../model/account");
const Vehicle = require("../model/vehicle");
const Vip = require("../model/vip");
const { Op, Sequelize } = require("sequelize");
const { AESDecrypt } = require("../lib/encryption");
const field_account = {
  polres_id: null,
  name_account: null,
  leader_team: null,
  id_vehicle: null,
  id_vip: null,
  id_account: null,
  password: null,
};
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
        order = 0,
        orderDirection = "asc",
      } = req.query;
      const modelAttr = Object.keys(Account.getAttributes());
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
      const count = await Account.count({
        where: getDataRules?.where,
      });
      const dataRes = await Account.findAll(getDataRules);
      var data = [];
      var dummyData = {};
      for (let i = 0; i < dataRes.length; i++) {
        const dataVehicle = await Vehicle.findOne({
          where: {
            id: AESDecrypt(dataRes[i]["id_vehicle"], {
              isSafeUrl: true,
              parseMode: "string",
            }),
          },
        });
        const dataVip = await Vip.findOne({
          where: {
            id: AESDecrypt(dataRes[i]["id_vip"], {
              isSafeUrl: true,
              parseMode: "string",
            }),
          },
        });
        dummyData["id"] = dataRes[i]["id"];
        dummyData["polres_id"] = dataRes[i]["polres_id"];
        dummyData["name_account"] = dataRes[i]["name_account"];
        dummyData["leader_team"] = dataRes[i]["leader_team"];
        dummyData["id_vehicle"] = dataRes[i]["id_vehicle"];
        dummyData["no_vehicle"] = dataVehicle["no_vehicle"];
        dummyData["id_vip"] = dataRes[i]["id_vip"];
        dummyData["vip"] = dataVip["name_vip"];
        dummyData["password"] = dataRes[i]["password"];
        dummyData["id_account"] = dataRes[i]["id_account"];
        data.push(dummyData);
      }
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
      const data = await Account.findOne({
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
      Object.keys(field_account).forEach((val, key) => {
        if (req.body[val]) {
          fieldValue[val] = req.body[val];
        }
      });
      await Account.create(fieldValue, { transaction: transaction });
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
      let fieldValue = {};
      Object.keys(field_account).forEach((val, key) => {
        if (req.body[val]) {
          fieldValue[val] = req.body[val];
        }
      });
      await Account.update(fieldValue, {
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
      await Account.destroy({
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
