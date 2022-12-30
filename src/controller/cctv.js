const { AESDecrypt } = require("../lib/encryption");
const response = require("../lib/response");
const Cctv = require("../model/cctv");
const db = require("../config/database");
const fs = require("fs");
const { Op, Sequelize } = require("sequelize");
const readXlsxFile = require("read-excel-file/node");
const _ = require("lodash");
const formidable = require("formidable");
const pagination = require("../lib/pagination-parser");

const fieldData = {
  address_cctv: null,
  vms_cctv: null,
  jenis_cctv: null,
  merek_cctv: null,
  type_cctv: null,
  ip_cctv: null,
  gateway_cctv: null,
  username_cctv: null,
  password_cctv: null,
  lat_cctv: null,
  lng_cctv: null,
  link_cctv: null,
  status_cctv: null,
  polda_id: null,
};
module.exports = class CctvController {
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
      const modelAttr = Object.keys(Cctv.getAttributes());
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
      const data = await Cctv.findAll(getData);
      const count = await Cctv.count({
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
      const data = await Cctv.findOne({
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
          if (val == "polda_id") {
            fieldValue[val] = AESDecrypt(req.body[val], {
              isSafeUrl: true,
              parseMode: "string",
            });
          } else {
            fieldValue[val] = req.body[val];
          }
        }
      });
      await Cctv.create(fieldValue, { transaction: transaction });
      await transaction.commit();
      response(res, true, "Succeed", null);
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };

  static addGeoJson = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let input = req.body.features;
      let dummy = [];

      var fieldValue = {};
      for (let i = 0; i < input.length; i++) {
        var cord;
        var latitude;
        var longitude;
        if (input[i]["geometry"]) {
          // console.log(input[i]["geometry"]["coordinates"]);
          cord = input[i]["geometry"]["coordinates"].split(",");
          latitude = parseFloat(cord[1]);
          longitude = parseFloat(cord[0]);
        } else {
          latitude = null;
          longitude = null;
        }
        fieldValue = {};
        fieldValue[
          "address_cctv"
        ] = `Arteri - ${input[i]["properties"]["nama"]}`;
        fieldValue["vms_cctv"] = `Arteri - ${input[i]["properties"]["nama"]}`;
        fieldValue["jenis_cctv"] = "cctv arteri";
        fieldValue["merek_cctv"] = "cctv arteri";
        fieldValue["type_cctv"] = "cctv arteri";
        fieldValue["ip_cctv"] = "https://jid.jasamargalive.com";
        fieldValue["gateway_cctv"] = "https://jid.jasamargalive.com";
        fieldValue["username_cctv"] = "korlantas";
        fieldValue["password_cctv"] = "korlantas";
        fieldValue["lat_cctv"] = latitude;
        fieldValue["lng_cctv"] = longitude;
        fieldValue[
          "link_cctv"
        ] = `https://jid.jasamarga.com/cctv2/${input[i]["properties"]["key id"]}?tx=`;
        fieldValue["status_cctv"] = 1;

        dummy.push(fieldValue);
      }

      const data = await Cctv.bulkCreate(dummy, {
        transaction: transaction,
      });
      await transaction.commit();
      response(res, true, "Succeed", dummy);
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
          //   iterator[1] != "1address_cctv" &&
          //   iterator[2] != "1vms_cctv" &&
          //   iterator[3] != "1jenis_cctv" &&
          //   iterator[4] != "1merek_cctv" &&
          //   iterator[5] != "1type_cctv" &&
          //   iterator[6] != "1ip_cctv" &&
          //   iterator[7] != "1gateway_cctv" &&
          //   iterator[8] != "1username_cctv" &&
          //   iterator[9] != "1password_cctv" &&
          //   iterator[10] != "1lat_cctv" &&
          //   iterator[11] != "1lng_cctv"
          // ) {
          //   response(res, false, "Failed", null);
          // }
        } else {
          listPolres.push({
            address_cctv: iterator[1],
            vms_cctv: iterator[2],
            jenis_cctv: iterator[3],
            merek_cctv: iterator[4],
            type_cctv: iterator[5],
            ip_cctv: iterator[6],
            gateway_cctv: iterator[7],
            username_cctv: iterator[8],
            password_cctv: iterator[9],
            lat_cctv: iterator[10] || null,
            lng_cctv: iterator[11] || null,
            link_cctv: iterator[12],
            status_cctv: iterator[13],
            polda_id: iterator[14] || null,
          });
        }
        index++;
      }
      const ress = await Cctv.bulkCreate(listPolres, {
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
          if (val == "polda_id") {
            fieldValue[val] = AESDecrypt(req.body[val], {
              isSafeUrl: true,
              parseMode: "string",
            });
          } else {
            fieldValue[val] = req.body[val];
          }
        }
      });
      await Cctv.update(fieldValue, {
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
      await Cctv.update(fieldValue, {
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
      await Cctv.destroy({
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
