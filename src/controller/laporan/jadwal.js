const { AESDecrypt } = require("../../lib/encryption");
const response = require("../../lib/response");
const DaftarPeserta = require("../../model/laporan/jadwal_ktt");
const db = require("../../config/database");
const fs = require("fs");
const { Op, Sequelize } = require("sequelize");
const readXlsxFile = require("read-excel-file/node");
const _ = require("lodash");

const pagination = require("../../lib/pagination-parser");

const fieldData = {
  title: null,
  parent: null,
};
module.exports = class HtController {
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
      const modelAttr = Object.keys(DaftarPeserta.getAttributes());
      let getData = { where: null };
      if (serverSide?.toLowerCase() === "true") {
        const resPage = pagination.getPagination(length, start);
        getData.limit = resPage.limit;
        getData.offset = resPage.offset;
      }
      getData.order = [
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
      let data = await DaftarPeserta.findAll({
        ...getData,
        where: {
          parent: {
            [Op.is]: null,
          },
        },
      });
      let listJadwal = [];
      for (const iterator of data) {
        let parentJadwal = await DaftarPeserta.findAll({
          where: {
            parent: iterator.dataValues.id,
          },
        });
        listJadwal.push({
          ...iterator.dataValues,
          list: parentJadwal,
          id: iterator.id,
        });
      }

      response(res, true, "Succeed", listJadwal);
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };

  static getId = async (req, res) => {
    try {
      const data = await DaftarPeserta.findOne({
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
      console.log(req.body);
      Object.keys(fieldData).forEach((val, key) => {
        if (req.body[val]) {
          if (val == "parent") {
            fieldValue[val] = AESDecrypt(req.body[val], {
              isSafeUrl: true,
              parseMode: "string",
            });
          } else {
            fieldValue[val] = req.body[val];
          }
        } else {
          fieldValue[val] = null;
        }
      });
      await DaftarPeserta.create(fieldValue, { transaction: transaction });
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
      console.log(req.body);
      Object.keys(fieldData).forEach((val, key) => {
        if (req.body[val]) {
          if (val == "fasum_logo") {
            let path = req.body.fasum_logo.filepath;
            let file = req.body.fasum_logo;
            let fileName = file.originalFilename;
            fs.renameSync(
              path,
              "./public/uploads/fasum_khusus/" + fileName,
              function (err) {
                if (err) throw err;
              }
            );
            fieldValue[val] = fileName;
          } else {
            fieldValue[val] = req.body[val];
          }
        }
      });
      await DaftarPeserta.update(fieldValue, {
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
      await DaftarPeserta.update(fieldValue, {
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
      await DaftarPeserta.destroy({
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
