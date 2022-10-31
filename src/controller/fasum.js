const { AESDecrypt } = require("../lib/encryption");
const response = require("../lib/response");
const Fasum = require("../model/fasum");
const db = require("../config/database");
const fs = require("fs");
const { Op, Sequelize } = require("sequelize");
const readXlsxFile = require("read-excel-file/node");
const _ = require("lodash");
const formidable = require("formidable");
const CategoryFasum = require("../model/category_fasum");
const pagination = require("../lib/pagination-parser");

const fieldData = {
  fasum_type: null,
  fasum_name: null,
  fasum_logo: null,
  fasum_address: null,
  fasum_phone: null,
  fasum_lat: null,
  fasum_lng: null,
  fasum_description: null,
  fasum_open_time: null,
  fasum_close_time: null,
  fasum_status: 0,
  fasum_radius: 0,
};
module.exports = class FasumController {
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
      const modelAttr = Object.keys(Fasum.getAttributes());
      let getData = { where: null };
      if (serverSide?.toLowerCase() === "true") {
        const resPage = pagination.getPagination(length, start);
        getData.limit = resPage.limit;
        getData.offset = resPage.offset;
      }
      // getDataRules.order = [[modelAttr[order], orderDirection.toUpperCase()]];
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
      const data = await Fasum.findAll({
        ...getData,
        include: [
          {
            model: CategoryFasum,
            foreignKey: "fasum_type",
            required: false,
          },
        ],
        subQuery: true,
      });
      const count = await Fasum.count({
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
      const data = await Fasum.findOne({
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
      await Fasum.create(fieldValue, { transaction: transaction });
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
      fs.renameSync(path, "./public/uploads/" + fileName, function (err) {
        if (err) response(res, false, "Error", err.message);
      });
      let readExcell = await readXlsxFile("./public/uploads/" + fileName);
      let index = 0;
      let listPolres = [];
      let idNotValid = [];
      for (const iterator of readExcell) {
        if (index == 0) {
          // if (
          //   iterator[1] != "1address_Fasum" &&
          //   iterator[2] != "1vms_Fasum" &&
          //   iterator[3] != "1jenis_Fasum" &&
          //   iterator[4] != "1merek_Fasum" &&
          //   iterator[5] != "1type_Fasum" &&
          //   iterator[6] != "1ip_Fasum" &&
          //   iterator[7] != "1gateway_Fasum" &&
          //   iterator[8] != "1username_Fasum" &&
          //   iterator[9] != "1password_Fasum" &&
          //   iterator[10] != "1lat_Fasum" &&
          //   iterator[11] != "1lng_Fasum"
          // ) {
          //   response(res, false, "Failed", null);
          // }
        } else {
          listPolres.push({
            fasum_type: iterator[1],
            fasum_name: iterator[2],
            fasum_logo: iterator[3],
            fasum_address: iterator[4],
            fasum_phone: iterator[5],
            fasum_lat: iterator[6] || null,
            fasum_lng: iterator[7] || null,
            fasum_description: iterator[8],
            fasum_open_time: iterator[9],
            fasum_close_time: iterator[10],
            fasum_status: iterator[11],
          });
        }
        index++;
      }
      const ress = await Fasum.bulkCreate(listPolres, {
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
      await Fasum.update(fieldValue, {
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
      await Fasum.update(fieldValue, {
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
      await Fasum.destroy({
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
