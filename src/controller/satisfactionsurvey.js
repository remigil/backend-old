const db = require("../config/database");
const response = require("../lib/response");
const Satisfaction = require("../model/satisfactionsurvey");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const pagination = require("../lib/pagination-parser");
const fs = require("fs");

const fieldData = {
  name_survey: null,
  address_survey: null,
  email_survey: null,
  design_survey: null,
  convenience_survey: null,
  accurate_survey: null,
  fast_survey: null,
};

module.exports = class SatisfactionController {
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
      const modelAttr = Object.keys(Satisfaction.getAttributes());
      let getDataRules = { where: null };
      if (serverSide?.toLowerCase() === "true") {
        const resPage = pagination.getPagination(length, start);
        getDataRules.limit = resPage.limit;
        getDataRules.offset = resPage.offset;
      }
      // if (order <= modelAttr.length) {
      //   getDataRules.order = [[modelAttr[order], orderDirection.toUpperCase()]];
      // }
      getDataRules.order = [
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
      const data = await Satisfaction.findAll(getDataRules);
      const count = await Satisfaction.count({
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
      const data = await Satisfaction.findOne({
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
  static countdesign = async (req, res) => {
    try {
      const design1 = await Satisfaction.count({
        where: {
          design_survey: 1,
        },
      });
      const design2 = await Satisfaction.count({
        where: {
          design_survey: 2,
        },
      });
      const design3 = await Satisfaction.count({
        where: {
          design_survey: 3,
        },
      });
      const design4 = await Satisfaction.count({
        where: {
          design_survey: 4,
        },
      });
      const design5 = await Satisfaction.count({
        where: {
          design_survey: 5,
        },
      });

      const design = {
        1: design1,
        2: design2,
        3: design3,
        4: design4,
        5: design5,
      };
      response(res, true, "Succeed", design);
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };
  static countconvenience = async (req, res) => {
    try {
      const convenience1 = await Satisfaction.count({
        where: {
          convenience_survey: 1,
        },
      });
      const convenience2 = await Satisfaction.count({
        where: {
          convenience_survey: 2,
        },
      });
      const convenience3 = await Satisfaction.count({
        where: {
          convenience_survey: 3,
        },
      });
      const convenience4 = await Satisfaction.count({
        where: {
          convenience_survey: 4,
        },
      });
      const convenience5 = await Satisfaction.count({
        where: {
          convenience_survey: 5,
        },
      });

      const convenience = {
        1: convenience1,
        2: convenience2,
        3: convenience3,
        4: convenience4,
        5: convenience5,
      };
      response(res, true, "Succeed", convenience);
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };
  static countaccurate = async (req, res) => {
    try {
      const accurate1 = await Satisfaction.count({
        where: {
          accurate_survey: 1,
        },
      });
      const accurate2 = await Satisfaction.count({
        where: {
          accurate_survey: 2,
        },
      });
      const accurate3 = await Satisfaction.count({
        where: {
          accurate_survey: 3,
        },
      });
      const accurate4 = await Satisfaction.count({
        where: {
          accurate_survey: 4,
        },
      });
      const accurate5 = await Satisfaction.count({
        where: {
          accurate_survey: 5,
        },
      });

      const accurate = {
        1: accurate1,
        2: accurate2,
        3: accurate3,
        4: accurate4,
        5: accurate5,
      };
      response(res, true, "Succeed", accurate);
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };
  static countfast = async (req, res) => {
    try {
      const fast1 = await Satisfaction.count({
        where: {
          fast_survey: 1,
        },
      });
      const fast2 = await Satisfaction.count({
        where: {
          fast_survey: 2,
        },
      });
      const fast3 = await Satisfaction.count({
        where: {
          fast_survey: 3,
        },
      });
      const fast4 = await Satisfaction.count({
        where: {
          fast_survey: 4,
        },
      });
      const fast5 = await Satisfaction.count({
        where: {
          fast_survey: 5,
        },
      });

      const fast = {
        1: fast1,
        2: fast2,
        3: fast3,
        4: fast4,
        5: fast5,
      };
      response(res, true, "Succeed", fast);
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
          fieldValueData[val] = req.body[val];
        }
      });
      Satisfaction.create(fieldValueData, {
        transaction: transaction,
      })
        .then(async (data) => {
          await transaction.commit();
          response(res, true, "Succeed", data);
        })
        .catch((err) => {
          console.log({ err });
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
          fieldValueData[val] = req.body[val];
        }
      });
      await Satisfaction.update(fieldValueData, {
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
      let fieldValue = {};
      fieldValue["deleted_at"] = new Date();
      await Satisfaction.update(fieldValue, {
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
      await Satisfaction.destroy({
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
