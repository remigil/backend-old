const { AESDecrypt } = require("../lib/encryption");
const response = require("../lib/response");
const CategoryFasum = require("../model/category_fasum");
const db = require("../config/database");
const fs = require("fs");
const { Op, Sequelize } = require("sequelize");
const readXlsxFile = require("read-excel-file/node");
const _ = require("lodash");
const formidable = require("formidable");

const fieldData = {
  name_category_fasum: null,
  description_category_fasum: null,
  status_category_fasum: 0,
};
module.exports = class CategoryFasumController {
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
      const modelAttr = Object.keys(CategoryFasum.getAttributes());
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
      const data = await CategoryFasum.findAll(getData);
      const count = await CategoryFasum.count({
        where: getData?.where,
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
      const data = await CategoryFasum.findOne({
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
      Object.keys(fieldData).forEach((val, key) => {
        if (req.body[val]) {
          fieldValue[val] = req.body[val];
        }
      });
      await CategoryFasum.create(fieldValue, { transaction: transaction });
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
      fs.renameSync(
        path,
        "./public/uploads/categoryFasum/" + fileName,
        function (err) {
          if (err) response(res, false, "Error", err.message);
        }
      );
      let readExcell = await readXlsxFile(
        "./public/uploads/categoryFasum/" + fileName
      );
      let index = 0;
      let listPolres = [];
      let idNotValid = [];
      for (const iterator of readExcell) {
        if (index == 0) {
          // if (
          //   iterator[1] != "1address_CategoryFasum" &&
          //   iterator[2] != "1vms_CategoryFasum" &&
          //   iterator[3] != "1jenis_CategoryFasum" &&
          //   iterator[4] != "1merek_CategoryFasum" &&
          //   iterator[5] != "1type_CategoryFasum" &&
          //   iterator[6] != "1ip_CategoryFasum" &&
          //   iterator[7] != "1gateway_CategoryFasum" &&
          //   iterator[8] != "1username_CategoryFasum" &&
          //   iterator[9] != "1password_CategoryFasum" &&
          //   iterator[10] != "1lat_CategoryFasum" &&
          //   iterator[11] != "1lng_CategoryFasum"
          // ) {
          //   response(res, false, "Failed", null);
          // }
        } else {
          listPolres.push({
            CategoryFasum_type: iterator[1],
            CategoryFasum_name: iterator[2],
            CategoryFasum_logo: iterator[3],
            CategoryFasum_address: iterator[4],
            CategoryFasum_phone: iterator[5],
            CategoryFasum_lat: iterator[6] || null,
            CategoryFasum_lng: iterator[7] || null,
            CategoryFasum_description: iterator[8],
            CategoryFasum_open_time: iterator[9],
            CategoryFasum_close_time: iterator[10],
            CategoryFasum_status: iterator[11],
          });
        }
        index++;
      }
      const ress = await CategoryFasum.bulkCreate(listPolres, {
        transaction: t,
      });
      await t.commit();

      response(res, true, "Succed", ress);
    } catch (error) {
      await t.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  static edit = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let fieldValue = {};
      Object.keys(fieldData).forEach((val, key) => {
        if (req.body[val]) {
          fieldValue[val] = req.body[val];
        }
      });
      await CategoryFasum.update(fieldValue, {
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
      await CategoryFasum.update(fieldValue, {
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
      await CategoryFasum.destroy({
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
