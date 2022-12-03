const { AESDecrypt } = require("../lib/encryption");
const response = require("../lib/response");
const OperationProfile = require("../model/operation_profile");
const db = require("../config/database");
const fs = require("fs");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const formidable = require("formidable");
const Polda = require("../model/polda");
const Polres = require("../model/polres");
const pagination = require("../lib/pagination-parser");

const fieldData = {
  banner: null,
  name_operation: null,
  document_sprint: null,
  background_image: null,
  logo: null,
  date_start_operation: null,
  date_end_operation: null,
  // level_operation: null,
};
Polda.hasMany(Polres, {
  foreignKey: "polda_id", // replaces `productId`
  sourceKey: "id",
});
module.exports = class OperationProfileController {
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
      const modelAttr = Object.keys(OperationProfile.getAttributes());
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
      const data = await OperationProfile.findAll({
        ...getData,
        include: [
          {
            model: Polda,
            as: "polda",
            required: false,
            include: [
              {
                model: Polres,
                required: false,
              },
            ],
          },
          // {
          //   model: Polres,
          //   as: "polres",
          //   required: false,
          // },
        ],
      });
      const count = await OperationProfile.count({
        where: getData?.where,
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
  static mobile = async (req, res) => {
    try {
      const [operation] = await db.query(
        `select * from operation_profile op where op.date_start_operation <= now() and op.date_end_operation >= now()`
      );
      response(res, true, "Berhasil", operation, 200);
    } catch (e) {
      response(res, false, e.message, e, 400);
    }
  };
  static getId = async (req, res) => {
    try {
      const data = await OperationProfile.findOne({
        where: {
          id: AESDecrypt(req.params.id, {
            isSafeUrl: true,
            parseMode: "string",
          }),
        },
        include: [
          {
            model: Polda,
            as: "polda",
            required: false,
          },
        ],
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
      let fieldValueData = {};
      Object.keys(fieldData).forEach((key) => {
        if (req.body[key]) {
          if (
            key == "banner" ||
            key == "background_image" ||
            key == "logo" ||
            key == "document_sprint"
          ) {
            let path = req.body[key].filepath;
            let file = req.body[key];
            let fileName = file.originalFilename;
            fs.renameSync(
              path,
              "./public/uploads/" + key + "/" + fileName,
              function (err) {
                if (err) throw err;
              }
            );
            fieldValueData[key] = fileName;
          } else {
            fieldValueData[key] = req.body[key];
          }
        } else {
          fieldValueData[key] = null;
        }
      });

      let op = await OperationProfile.create(fieldValueData, {
        transaction: transaction,
      });
      await transaction.commit();
      response(res, true, "Succeed", op);
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };
  static edit = async (req, res) => {
    const transaction = await db.transaction();

    try {
      let fieldValueData = {};
      Object.keys(fieldData).forEach((key) => {
        if (req.body[key]) {
          if (
            key == "banner" ||
            key == "background_image" ||
            key == "logo" ||
            key == "document_sprint"
          ) {
            let path = req.body[key].filepath;
            let file = req.body[key];
            let fileName = file.originalFilename;
            fs.renameSync(
              path,
              "./public/uploads/" + key + "/" + fileName,
              function (err) {
                if (err) throw err;
              }
            );
            fieldValueData[key] = fileName;
          } else {
            fieldValueData[key] = req.body[key];
          }
        }
      });
      await OperationProfile.update(fieldValueData, {
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
      await OperationProfile.destroy({
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
