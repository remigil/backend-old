const db = require("../config/database");
const response = require("../lib/response");
const Account = require("../model/account");
const Vehicle = require("../model/vehicle");
const Vip = require("../model/vip");
const Polres = require("../model/polres");

const { Op, Sequelize } = require("sequelize");
const { AESDecrypt } = require("../lib/encryption");
const Officer = require("../model/officer");
const field_account = {
  name_account: null,
  leader_team: null,
  id_vehicle: null,
  id_account: null,
  id_vip: null,
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
            model: Vip,
            as: "vips",
            foreignKey: "id_vip",
            required: false,
          },
          {
            model: Officer,
            as: "officer",
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
            model: Vip,
            as: "vips",
            foreignKey: "id_vip",
            required: false,
          },
          {
            model: Officer,
            as: "officer",
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
      let fieldValue = {};
      Object.keys(field_account).forEach((val, key) => {
        if (req.body[val]) {
          if (val == "polres_id" || val == "id_vehicle" || val == "id_vip") {
            fieldValue[val] = AESDecrypt(req.body[val], {
              isSafeUrl: true,
              parseMode: "string",
            });
          } else {
            fieldValue[val] = req.body[val];
          }
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
          if (val == "polres_id" || val == "id_vehicle" || val == "id_vip") {
            fieldValue[val] = AESDecrypt(req.body[val], {
              isSafeUrl: true,
              parseMode: "string",
            });
          } else {
            fieldValue[val] = req.body[val];
          }
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
