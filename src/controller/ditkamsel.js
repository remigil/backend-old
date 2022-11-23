const db = require("../config/database");
const response = require("../lib/response");
const Ditkamsel = require("../model/ditkamsel");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");

module.exports = class DitkamselController {
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
      const modelAttr = Object.keys(Ditkamsel.getAttributes());
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
        filter.forEach((fkey, index) => {
          if (_.includes(modelAttr, fkey)) {
            filters[fkey] = filterSearch[index];
          }
        });
        getDataRules.where = {
          ...getDataRules.where,
          ...filters,
        };
      }

      const data = await Ditkamsel.findAll(getDataRules);
      const count = await Ditkamsel.count({
        where: getDataRules?.where,
      });
      response(res, true, "Succeed", {
        data,
        recordsFiltered: count,
        recordsTotal: count,
      });
    } catch (error) {
      response(res, false, "Failed", error.message);
    }
  };

  static add = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let ts = Date.now();

      let date_ob = new Date(ts);
      let date = date_ob.getDate();
      let month = date_ob.getMonth() + 1;
      let year = date_ob.getFullYear();

      let data = {};
      await Ditkamsel.create(
        {
          polres_id: req.body.polres_id,
          polda_id: req.body.polda_id,
          category: req.body.category,
          media_cetak: req.body.media_cetak,
          media_elektronik: req.body.media_elektronik,
          media_sosial: req.body.media_sosial,
          laka_langgar: req.body.laka_langgar,
          spanduk: req.body.spanduk,
          leaflet: req.body.leaflet,
          stike: req.body.stiker,
          billboard: req.body.billboard,
        },
        { transaction: transaction }
      );
      await transaction.commit();
      response(res, true, "Succeed", data);
    } catch (error) {
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };
};
