const db = require("../config/database");
const response = require("../lib/response");
const Polda = require("../model/polda");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");
const pagination = require("../lib/pagination-parser");

const field_polda = {
  code_satpas: null,
  name_polda: null,
  address: null,
  logo_polda: null,
  phone_polda: null,
  image: null,
  hotline: null,
  website: null,
  latitude: null,
  longitude: null,
  zoomview: null,
  file_shp: null,
  open_time: null,
  close_time: null,
  urutan: null,
  facebook: null,
  instagram: null,
  twitter: null,
  youtube: null,
  link_playlist: null,
};
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
        order = 0,
        orderDirection = "asc",
      } = req.query;
      const modelAttr = Object.keys(Polda.getAttributes());
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
      getDataRules.order = [["urutan", "ASC"]];
      const data = await Polda.findAll(getDataRules).then((result) => {
        const dummy = result.map((row) => {
          //this returns all values of the instance,
          //also invoking virtual getters
          const el = row.get();
          el["polda_id"] = AESDecrypt(el.id, {
            isSafeUrl: true,
            parseMode: "string",
          });
          return el;
        });
        return dummy;
      });
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

  static getNoEncrypt = async (req, res) => {
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
      const modelAttr = Object.keys(Polda.getAttributes());
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
      const data = await Polda.findAll(getDataRules).then((result) => {
        const dummy = result.map((row) => {
          //this returns all values of the instance,
          //also invoking virtual getters
          const el = row.get();
          el.id = AESDecrypt(el.id, {
            isSafeUrl: true,
            parseMode: "string",
          });
          return el;
        });
        return dummy;
      });
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

  static get_web = async (req, res) => {
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
      const modelAttr = Object.keys(Polda.getAttributes());
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

  static getId = async (req, res) => {
    try {
      let data = await Polda.findOne({
        where: {
          id: AESDecrypt(req.params.id, {
            isSafeUrl: true,
            parseMode: "string",
          }),
        },
      });

      data.dataValues.polda_id = data.dataValues.id;
      console.log(data);
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
      Object.keys(field_polda).forEach((val, key) => {
        if (req.body[val]) {
          if (val == "logo_polda") {
            let path = req.body.logo_polda.filepath;
            let file = req.body.logo_polda;
            let fileNameLogo = file.originalFilename;
            fs.renameSync(
              path,
              "./public/uploads/polda/logo/" + fileNameLogo,
              function (err) {
                if (err) throw err;
              }
            );
            input[val] = fileNameLogo;
          } else if (val == "image") {
            let path = req.body.image.filepath;
            let file = req.body.image;
            let fileName = file.originalFilename;
            fs.renameSync(
              path,
              "./public/uploads/polda/image/" + fileName,
              function (err) {
                if (err) throw err;
              }
            );
            input[val] = fileName;
          } else {
            input[val] = req.body[val];
          }
        } else {
          input[val] = null;
        }
      });
      let op = await Polda.create(input, {
        transaction: transaction,
      });
      await transaction.commit();
      response(res, true, "Succeed", op);
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
      let listPolda = [];
      for (const iterator of readExcell) {
        if (index == 0) {
          if (iterator[1] != "Polda") {
            response(res, false, "Format Salah", null);
          }
        } else {
          listPolda.push({
            code_satpas: iterator[1],
            name_polda: iterator[2],
            address: iterator[3],
            logo_polda: iterator[4] | null,
            phone_polda: iterator[5] | null,
            image: iterator[6] | null,
            hotline: iterator[7] | null,
            latitude: iterator[8] | null,
            longitude: iterator[9] | null,
            open_time: iterator[10] || null,
            close_time: iterator[11] || null,
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
      let input = {};
      Object.keys(field_polda).forEach((val, key) => {
        if (req.body[val]) {
          if (val == "logo_polda") {
            let path = req.body.logo_polda.filepath;
            let file = req.body.logo_polda;
            let fileNameLogo = file.originalFilename;
            fs.renameSync(
              path,
              "./public/uploads/polda/logo/" + fileNameLogo,
              function (err) {
                if (err) throw err;
              }
            );
            input[val] = fileNameLogo;
          } else if (val == "image") {
            let path = req.body.image.filepath;
            let file = req.body.image;
            let fileName = file.originalFilename;
            fs.renameSync(
              path,
              "./public/uploads/polda/image/" + fileName,
              function (err) {
                if (err) throw err;
              }
            );
            input[val] = fileName;
          } else {
            input[val] = req.body[val];
          }
        }
      });
      let op = await Polda.update(input, {
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

  static editJson = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let input = req.body.polda;
      const poldaUp = await Polda.bulkCreate(input, {
        updateOnDuplicate: ["file_shp"],
        transaction: transaction,
      });
      await transaction.commit();
      response(res, true, "Succeed", poldaUp);
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
      await Polda.update(fieldValue, {
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

};
