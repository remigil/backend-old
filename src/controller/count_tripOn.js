const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const { Op, Sequelize, where } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");

const Trip_on = require("../model/trip_on");

module.exports = class CountTripOnController {
  static get_type = async (req, res) => {
    try {
      const {
        start_date = null,
        end_date = null,
        filter = null,
        date = null,
        type_vehicle = null,
      } = req.query;

      const getDataRules = {
        group: "type_id",
        attributes: [
          "type_id",
          [Sequelize.fn("count", Sequelize.col("type_id")), "jumlah"],
        ],
      };

      if (date) {
        getDataRules.where = {
          departure_date: date,
        };
      }
      let finals = [];
      let data = await Trip_on.findAll(getDataRules);

      if (data.length == 0) {
        finals.push(
          {
            nama: "Mobil",
            jumlah: 0,
          },
          {
            nama: "Motor",
            jumlah: 0,
          }
        );
      } else if (data.length != 2) {
        data.map((element, index) => {
          if (element.dataValues.type_id == 1) {
            finals.push(
              {
                nama: "Mobil",
                jumlah: parseInt(element.dataValues.jumlah),
              },
              {
                nama: "Motor",
                jumlah: 0,
              }
            );
          } else {
            finals.push(
              {
                nama: "Mobil",
                jumlah: 0,
              },
              {
                nama: "Motor",
                jumlah: parseInt(element.dataValues.jumlah),
              }
            );
          }
        });
      } else {
        data.map((element, index) => {
          finals.push({
            nama: element.dataValues.type_id == 1 ? "Mobil" : "Motor",
            jumlah: parseInt(element.dataValues.jumlah),
          });
        });
      }
      response(res, true, "Succeed", finals);
    } catch (error) {
      response(res, false, "Failed", error.message);
    }
  };
};
