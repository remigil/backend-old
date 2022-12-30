const { AESDecrypt } = require("../lib/encryption");
const response = require("../lib/response");
const Vehicle = require("../model/vehicle");
const fs = require("fs");
const { Op, Sequelize } = require("sequelize");
const readXlsxFile = require("read-excel-file/node");
const _ = require("lodash");
const db = require("../config/database");
const pagination = require("../lib/pagination-parser");

module.exports = class VehicleController {
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
      const modelAttr = Object.keys(Vehicle.getAttributes());
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
      const data = await Vehicle.findAll(getData);
      const count = await Vehicle.count({
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
      const data = await Vehicle.findOne({
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
      let create = await Vehicle.create(
        {
          no_vehicle: req.body.no_vehicle,
          back_number_vehicle: req.body.back_number_vehicle,
          type_vehicle: req.body?.type_vehicle,
          brand_vehicle: req.body?.brand_vehicle,
          fuel_vehicle: req.body?.fuel_vehicle,
          ownership_vehicle: req.body?.ownership_vehicle,
        },
        { transaction: transaction }
      );
      await transaction.commit();
      response(res, true, "Succeed", create);
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
            no_vehicle: iterator[1],
            type_vehicle: iterator[2],
            brand_vehicle: iterator[3],
            ownership_vehicle: iterator[4],
            fuel_vehicle: iterator[5],
            back_number_vehicle: iterator[6] || null,
          });
        }
        index++;
      }
      const ress = await Vehicle.bulkCreate(listPolres, {
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
      await Vehicle.update(
        {
          no_vehicle: req.body.no_vehicle,
          back_number_vehicle: req.body.back_number_vehicle,
          type_vehicle: req.body?.type_vehicle,
          brand_vehicle: req.body?.brand_vehicle,
          fuel_vehicle: req.body?.fuel_vehicle,
          ownership_vehicle: req.body?.ownership_vehicle,
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
      await Vehicle.destroy({
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
