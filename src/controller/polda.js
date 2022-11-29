const db = require("../config/database");
const response = require("../lib/response");
const Polda = require("../model/polda");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");
const pagination = require("../lib/pagination-parser");
module.exports = class PoldaController {
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
      const modelAttr = Object.keys(Polda.getAttributes());
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
      const data = await Polda.findAll(getDataRules);
      const count = await Polda.count({
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
      await Polda.create(
        {
          polda_id: req.body.polda_id,
          name_polres: req.body.name_polres,
          code_satpas: req.body.code_satpas,
          address: req.body.address,
          latitude: req.body.latitude || null,
          longitude: req.body.longitude || null,
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
  static importExcell = async (req, res) => {
    const t = await db.transaction();
    try {
      let path = req.body.file.filepath;
      let file = req.body.file;
      let fileName = file.originalFilename;
      fs.renameSync(path, "./public/upload/" + fileName, function (err) {
        if (err) response(res, false, "Error", err.message);
      });
      let readExcell = await readXlsxFile("./public/upload/" + fileName);
      let index = 0;
      let listPolda = [];
      for (const iterator of readExcell) {
        if (index == 0) {
          if (iterator[1] != "Polda") {
            response(res, false, "Format Salah", null);
          }
        } else {
          listPolda.push({
            name_polda: iterator[1],
          });
        }
        index++;
      }
      const poldaUp = await Polda.bulkCreate(listPolda, {
        transaction: t,
      });
      await t.commit();

      response(res, true, "Succed", poldaUp);
    } catch (error) {
      await t.rollback();
      response(res, false, "Failed", error.message);
    }
  };
  static edit = async (req, res) => {
    const transaction = await db.transaction();
    try {
      await Polda.update(
        {
          name_polda: req.body?.name_polda,
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
      await Polda.destroy({
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
  static getId = async (req, res) => {
    try {
      const data = await Polda.findOne({
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
};
