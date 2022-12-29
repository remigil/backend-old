const db = require("../config/database");
const response = require("../lib/response");
const Stackholder = require("../model/stackholder");

const Layanan_Stackholder = require("../model/layanan_stackholder");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");
const pagination = require("../lib/pagination-parser");

Stackholder.hasMany(Layanan_Stackholder, {
  foreignKey: "stackholder_id",
  as: "layanan_stackholder",
});

const field_stackholder = {
  title: null,
  fullname: null,
  icon: null,
  url: null,
  alamat: null,
  no_telp: null,
  call_center: null,
  email: null,
  fax: null,
  facebook: null,
  twitter: null,
  instagram: null,
  youtube: null,
  latitude: null,
  longitude: null,
  link_playlist: null,
  link_gmaps: null,
};

module.exports = class StackController {
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
      const modelAttr = Object.keys(Stackholder.getAttributes());
      let getDataRules = {
        where: null,
        include: [
          {
            model: Layanan_Stackholder,
            as: "layanan_stackholder",
            required: false,
          },
        ],
      };
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
      const data = await Stackholder.findAll(getDataRules);
      const count = await Stackholder.count({
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

  static edit = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let input = {};
      Object.keys(field_stackholder).forEach((val, key) => {
        if (req.body[val]) {
          if (val == "icon") {
            let path = req.body.icon.filepath;
            let file = req.body.icon;
            let fileNameLogo = file.originalFilename;
            fs.renameSync(
              path,
              "./public/uploads/stakeholder/" + fileNameLogo,
              function (err) {
                if (err) throw err;
              }
            );
            input[val] = fileNameLogo;
          } else {
            input[val] = req.body[val];
          }
        }
      });
      let op = await Stackholder.update(input, {
        where: {
          id: AESDecrypt(req.params.id, {
            isSafeUrl: true,
            parseMode: "string",
          }),
        },
        transaction: transaction,
      });
      await transaction.commit();
      response(res, true, "Succeed", input);
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };

  static getId = async (req, res) => {
    try {
      const data = await Stackholder.findOne({
        include: [{
          model: Layanan_Stackholder,
          as: 'layanan_stackholder',
          required: false
        }],
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
      let input = {};
      Object.keys(field_stackholder).forEach((val, key) => {
        if (req.body[val]) {
          if (val == "icon") {
            let path = req.body.icon.filepath;
            let file = req.body.icon;
            let fileNameLogo = file.originalFilename;
            fs.renameSync(
              path,
              "./public/uploads/stakeholder/" + fileNameLogo,
              function (err) {
                if (err) throw err;
              }
            );
            input[val] = fileNameLogo;
          } else {
            input[val] = req.body[val];
          }
        } else {
          input[val] = null;
        }
      });
      let op = await Stackholder.create(input, {
        transaction: transaction,
      });
      await transaction.commit();
      response(res, true, "Succeed", op);
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
      await Stackholder.update(fieldValue, {
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
      await Stackholder.destroy({
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

