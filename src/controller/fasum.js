const { AESDecrypt, AESEncrypt } = require("../lib/encryption");
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
const direction_route = require("../middleware/direction_route");
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
  polda_id: null,
  polres_id: null,
  fasum_geoJson: null,
  route: null,
  fasum_color: null,
  fasum_image: null,
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
        attributes: {
          exclude: ["direction_route"],
        },
        subQuery: true,
      }).then((result) => {
        const dummy = result.map((row) => {
          //this returns all values of the instance,
          //also invoking virtual getters
          const el = row.get();
          if (el.polda_id != null) {
            el["id_polda"] = AESEncrypt(String(el.polda_id), {
              isSafeUrl: true,
              // parseMode: "string",
            });
          } else {
            el["id_polda"] = null;
          }
          if (el.polres_id != null) {
            el["id_polres"] = AESEncrypt(String(el.polres_id), {
              isSafeUrl: true,
              // parseMode: "string",
            });
          } else {
            el["id_polres"] = null;
          }
          return el;
        });
        return dummy;
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
      }).then((result) => {
        // console.log(result.get());
        // this returns all values of the instance,
        // also invoking virtual getters

        const el = result.get();
        if (el.polda_id != null) {
          el["id_polda"] = AESEncrypt(String(el.polda_id), {
            isSafeUrl: true,
            // parseMode: "string",
          });
        } else {
          el["id_polda"] = null;
        }
        if (el.polres_id != null) {
          el["id_polres"] = AESEncrypt(String(el.polres_id), {
            isSafeUrl: true,
            // parseMode: "string",
          });
        } else {
          el["id_polres"] = null;
        }
        return el;

        // return dummy;
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
      // console.log(req.body);
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
          } else if (val == "fasum_image") {
            let path = req.body.fasum_image.filepath;
            let file = req.body.fasum_image;
            let fileName = file.originalFilename;
            fs.renameSync(
              path,
              "./public/uploads/fasum_khusus/" + fileName,
              function (err) {
                if (err) throw err;
              }
            );
            fieldValue[val] = fileName;
          } else if (val == "fasum_geoJson" || val == "route") {
            fieldValue[val] = JSON.parse(req.body[val]);
          } else if (val == "polda_id" || val == "polres_id") {
            fieldValue[val] = AESDecrypt(req.body[val], {
              isSafeUrl: true,
              parseMode: "string",
            });
          } else {
            fieldValue[val] = req.body[val];
          }
        }
      });
      const createDirectionRoute = await Fasum.create(fieldValue, {
        transaction: transaction,
      });
      await transaction.commit();
      if (req.body.route) {
        direction_route(JSON.parse(req.body.route))
          .then(async (data) => {
            console.log({ data });
            await Fasum.update(
              {
                direction_route: data.route,
              },
              {
                where: {
                  id: createDirectionRoute.dataValues.id,
                },
              }
            );
          })
          .catch((err) => {
            console.log({ err });
          });
      }

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
            fasum_image: iterator[12],
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

  static addJson = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let input = req.body.features;
      let dummy = [];

      var fieldValue = {};
      for (let i = 0; i < input.length; i++) {
        fieldValue = {};
        fieldValue["fasum_type"] = input[i]["fasum_type"];
        fieldValue["fasum_name"] = input[i]["fasum_name"];
        fieldValue["fasum_logo"] = input[i]["fasum_logo"];
        fieldValue["fasum_image"] = input[i]["fasum_image"];
        // fieldValue["fasum_address"] = input[i]["properties"];
        // fieldValue["fasum_phone"] = input[i]["properties"];
        fieldValue["fasum_lat"] = input[i]["fasum_lat"];
        fieldValue["fasum_lng"] = input[i]["fasum_lng"];
        // fieldValue["fasum_description"] = `<p>
        //                                     Daftar Resto : ${input[i]["properties"]["dftr_resto"]} </br>
        //                                     Daftar Mushola : ${input[i]["properties"]["dftr_musho"]} </br>
        //                                     Daftar Mini Market : ${input[i]["properties"]["dftr_minim"]} </br>
        //                                     Daftar ATM : ${input[i]["properties"]["dftr_atm"]} </br>
        //                                     Daftar Bengekel : ${input[i]["properties"]["dftr_bengk"]}
        //                                   </p>`;
        fieldValue["fasum_description"] = input[i]["fasum_description"];
        fieldValue["fasum_open_time"] = "00:00:00";
        fieldValue["fasum_close_time"] = "23:00:00";
        fieldValue["fasum_status"] = 1;
        fieldValue["fasum_radius"] = 0;
        fieldValue["polda_id"] = null;

        dummy.push(fieldValue);
      }

      const data = await Fasum.bulkCreate(dummy, {
        transaction: transaction,
      });
      await transaction.commit();
      response(res, true, "Succeed", dummy);
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
          } else if (val == "fasum_image") {
            let path = req.body.fasum_image.filepath;
            let file = req.body.fasum_image;
            let fileName = file.originalFilename;
            fs.renameSync(
              path,
              "./public/uploads/fasum_khusus/" + fileName,
              function (err) {
                if (err) throw err;
              }
            );
            fieldValue[val] = fileName;
          } else if (val == "fasum_geoJson" || val == "route") {
            fieldValue[val] = JSON.parse(req.body[val]);
          } else if (val == "polda_id") {
            fieldValue[val] = AESDecrypt(req.body[val], {
              isSafeUrl: true,
              parseMode: "string",
            });
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
      if (req.body.route) {
        direction_route(JSON.parse(req.body.route))
          .then(async (data) => {
            await Fasum.update(
              {
                direction_route: data.route,
              },
              {
                where: {
                  id: AESDecrypt(req.params.id, {
                    isSafeUrl: true,
                    parseMode: "string",
                  }),
                },
              }
            );
          })
          .catch((err) => {
            console.log({ err });
          });
      }
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
