const { AESDecrypt } = require("../lib/encryption");
const response = require("../lib/response");
const Schedule = require("../model/schedule");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const db = require("../config/database");
module.exports = class ScheduleController {
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
      const modelAttr = Object.keys(Schedule.getAttributes());
      let getData = { where: null };
      if (serverSide?.toLowerCase() === "true") {
        getData.limit = length;
        getData.offset = start;
      }
      if (order <= modelAttr.length) {
        getData.order = [[modelAttr[order], orderDirection.toUpperCase()]];
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
      const data = await Schedule.findAll(getData);
      const count = await Schedule.count({
        where: getData?.where,
      });
      const adaw =
        '[{"latlong":"1.2323, -8.239393"},{"latlong":"2.2323, -9.239393"}]';
      response(res, true, "Succeed", {
        data,
        recordsFiltered: count,
        recordsTotal: count,
        test: JSON.parse(adaw),
      });
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };

  static getId = async (req, res) => {
    try {
      const data = await Schedule.findOne({
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
      await Schedule.create(
        {
          activity: req.body.activity,
          id_vip: req.body?.id_vip,
          id_team: req.body?.id_team,
          date_schedule: req.body?.date_schedule,
          start_time: req.body?.start_time,
          end_time: req.body?.end_time,
          coordinate_schedule: req.body?.coordinate_schedule,
        },
        { transaction: transaction }
      );
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
      await Schedule.update(
        {
          activity: req.body.activity,
          id_vip: req.body?.id_vip,
          id_team: req.body?.id_team,
          date_schedule: req.body?.date_schedule,
          start_time: req.body?.start_time,
          end_time: req.body?.end_time,
          coordinate_schedule: req.body?.coordinate_schedule,
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
  static delete = async (req, res) => {
    const transaction = await db.transaction();
    try {
      await Schedule.destroy({
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
