const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const { Op, Sequelize, where } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");

const Trip_on = require("../model/trip_on");
const Prov = require("../model/provinsi");
const KabKot = require("../model/kabkot");

// Prov.hasMany(Trip_on, {
//   foreignKey: "kode_prov_start",
//   sourceKey: "kode",
//   as: "start_prov",
// });
// Prov.hasMany(Trip_on, {
//   foreignKey: "kode_prov_end",
//   sourceKey: "kode",
//   as: "end_prov",
// });

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

  static prov_tripon = async (req, res) => {
    try {
      const {
        filter,
        start_prov,
        end_prov,
        limit = 34,
        topTripon = false,
      } = req.query;

      const [depature, depature_metadata] = await db.query(
        `SELECT "provinsi"."id", "provinsi"."kode", "provinsi"."nama", count("kode_prov_start") AS "keberangkatan" FROM "provinsi" AS "provinsi" LEFT OUTER JOIN "trip_on" AS "start_prov" ON "provinsi"."kode" = "start_prov"."kode_prov_start" AND "start_prov"."deleted_at" IS NULL WHERE "provinsi"."deleted_at" IS NULL GROUP BY "provinsi"."id"`
      );

      const [arrival, arrival_metadata] = await db.query(
        `SELECT "provinsi"."id", "provinsi"."kode", "provinsi"."nama", count("kode_prov_end") AS "kedatangan" FROM "provinsi" AS "provinsi" LEFT OUTER JOIN "trip_on" AS "end_prov" ON "provinsi"."kode" = "end_prov"."kode_prov_end" AND "end_prov"."deleted_at" IS NULL WHERE "provinsi"."deleted_at" IS NULL GROUP BY "provinsi"."id"`
      );

      let rows = [];
      for (let i = 0; i < arrival.length; i++) {
        rows.push({
          kode: arrival[i].kode,
          nama: arrival[i].nama,
          kedatangan: parseInt(arrival[i].kedatangan),
          keberangkatan: parseInt(depature[i].keberangkatan),
          total:
            parseInt(arrival[i].kedatangan) +
            parseInt(depature[i].keberangkatan),
        });
      }

      if (topTripon) {
        rows.sort((a, b) => b.total - a.total);
        rows = rows.slice(0, limit);
      }
      response(res, true, "Succeed", rows);
    } catch (error) {
      response(res, false, "Failed", error.message);
    }
  };
};
