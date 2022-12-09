const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const { Op, Sequelize, where } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");

const Trip_on = require("../model/trip_on");
const Passenger_trip_on = require("../model/passenger_trip_on");
const Type_vehicle = require("../model/type_vehicle");
const Brand_vehicle = require("../model/brand_vehicle");
const Society = require("../model/society");
const Public_vehicle = require("../model/public_vehicle");

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
        time = null,
        start_time = null,
        end_time = null,
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

      if (filter) {
        if (time) {
          getDataRules.where = {
            departure_date: {
              [Op.and]: {
                [Op.between]: [start_date, end_date],
                [Op.between]: [start_time, end_time],
              },
            },
          };
        }

        getDataRules.where = {
          departure_date: {
            [Op.between]: [start_date, end_date],
          },
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
        filter = false,
        time = false,
        start_date,
        end_date,
        start_time,
        end_time,
        start_prov,
        end_prov,
        limit = 34,
        topTripon = false,
      } = req.query;

      let [depature, depature_metadata] = "";
      let [arrival, arrival_metadata] = "";
      if (filter) {
        if (time) {
          [depature, depature_metadata] = await db.query(
            `SELECT "provinsi"."id", "provinsi"."kode", "provinsi"."nama", count("kode_prov_start") AS "keberangkatan" FROM "provinsi" AS "provinsi" LEFT OUTER JOIN "trip_on" AS "start_prov" ON "provinsi"."kode" = "start_prov"."kode_prov_start" AND ("start_prov"."departure_date" BETWEEN '${start_date}' AND '${end_date}' AND "start_prov"."departure_time" BETWEEN '${start_time}' AND '${end_time}') AND "start_prov"."deleted_at" IS NULL WHERE "provinsi"."deleted_at" IS NULL GROUP BY "provinsi"."id", "kode_prov_start"`
          );

          [arrival, arrival_metadata] = await db.query(
            `SELECT "provinsi"."id", "provinsi"."kode", "provinsi"."nama", count("kode_prov_end") AS "kedatangan" FROM "provinsi" AS "provinsi" LEFT OUTER JOIN "trip_on" AS "start_prov" ON "provinsi"."kode" = "start_prov"."kode_prov_start" AND ("start_prov"."departure_date" BETWEEN '${start_date}' AND '${end_date}' AND "start_prov"."departure_time" BETWEEN '${start_time}' AND '${end_time}') AND "start_prov"."deleted_at" IS NULL WHERE "provinsi"."deleted_at" IS NULL GROUP BY "provinsi"."id", "kode_prov_end"`
          );
        }

        [depature, depature_metadata] = await db.query(
          `SELECT "provinsi"."id", "provinsi"."kode", "provinsi"."nama", count("kode_prov_start") AS "keberangkatan" FROM "provinsi" AS "provinsi" LEFT OUTER JOIN "trip_on" AS "start_prov" ON "provinsi"."kode" = "start_prov"."kode_prov_start" AND "start_prov"."deleted_at" IS NULL AND "start_prov"."departure_date" BETWEEN '${start_date}' AND '${end_date}' WHERE "provinsi"."deleted_at" IS NULL GROUP BY "provinsi"."id", "kode_prov_start"`
        );

        [arrival, arrival_metadata] = await db.query(
          `SELECT "provinsi"."id", "provinsi"."kode", "provinsi"."nama", count("kode_prov_end") AS "kedatangan" FROM "provinsi" AS "provinsi" LEFT OUTER JOIN "trip_on" AS "end_prov" ON "provinsi"."kode" = "end_prov"."kode_prov_end" AND "end_prov"."deleted_at" IS NULL AND "end_prov"."departure_date" BETWEEN '${start_date}' AND '${end_date}' WHERE "provinsi"."deleted_at" IS NULL GROUP BY "provinsi"."id", "kode_prov_end"`
        );
      } else {
        [depature, depature_metadata] = await db.query(
          `SELECT "provinsi"."id", "provinsi"."kode", "provinsi"."nama", count("kode_prov_start") AS "keberangkatan" FROM "provinsi" AS "provinsi" LEFT OUTER JOIN "trip_on" AS "start_prov" ON "provinsi"."kode" = "start_prov"."kode_prov_start" AND "start_prov"."deleted_at" IS NULL WHERE "provinsi"."deleted_at" IS NULL GROUP BY "provinsi"."id", "kode_prov_start"`
        );

        [arrival, arrival_metadata] = await db.query(
          `SELECT "provinsi"."id", "provinsi"."kode", "provinsi"."nama", count("kode_prov_end") AS "kedatangan" FROM "provinsi" AS "provinsi" LEFT OUTER JOIN "trip_on" AS "end_prov" ON "provinsi"."kode" = "end_prov"."kode_prov_end" AND "end_prov"."deleted_at" IS NULL WHERE "provinsi"."deleted_at" IS NULL GROUP BY "provinsi"."id", "kode_prov_end"`
        );
      }

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

  // static prov_tripon = async (req, res) => {
  //   try {
  //     let rows = await Prov.findAll({
  //       group: ["provinsi.id", "kode_prov_end"],
  //       logging: console.log,
  //       attributes: [
  //         "kode",
  //         "nama",
  //         [Sequelize.fn("count", Sequelize.col("kode_prov_end")), "kedatangan"],
  //       ],
  //       include: [
  //         {
  //           model: Trip_on,
  //           required: false,
  //           attributes: [],
  //           as: "start_prov",
  //           where: {
  //             [Op.and]: [
  //               {
  //                 departure_date: {
  //                   [Op.between]: ["2022-10-26", "2022-10-26"],
  //                 },
  //               },
  //               {
  //                 departure_time: {
  //                   [Op.between]: ["09:00:00", "21:00:00"],
  //                 },
  //               },
  //             ],
  //           },
  //         },
  //       ],
  //       nest: true,
  //       subQuery: false,
  //     });
  //     response(res, true, "Succeed", rows);
  //   } catch (error) {
  //     response(res, false, "Failed", error.message);
  //   }
  // };

  static daily_tripon = async (req, res) => {
    try {
      const {
        type = null,
        start_date = null,
        end_date = null,
        filter = null,
        date = null,
        serverSide = null,
        length = null,
        start = null,
        polda_id = null,
        topPolda = null,
      } = req.query;

      var list_day = [];
      var list_month = [];

      for (
        var m = moment(start_date);
        m.isSameOrBefore(end_date);
        m.add(1, "days")
      ) {
        list_day.push(m.format("YYYY-MM-DD"));
      }

      for (
        var m = moment(start_date);
        m.isSameOrBefore(end_date);
        m.add(1, "month")
      ) {
        list_month.push(m.format("MMMM"));
      }

      let wheres = {};
      if (filter) {
        wheres.date = {
          [Op.between]: [start_date, end_date],
        };
      }

      let tripOn = await Trip_on.findAll({
        group: ["trip_on.id", "departure_date"],
        attributes: [
          "departure_date",
          [Sequelize.fn("count", Sequelize.col("name")), "jumlah_penumpang"],
        ],
        include: [
          {
            model: Passenger_trip_on,
            attributes: [],
            required: false,
          },
        ],
        nest: true,
        subQuery: false,
      });
      response(res, true, "Succeed", tripOn);
    } catch (error) {
      response(res, false, "Failed", error.message);
    }
  };

  static filter = async (req, res) => {
    try {
      const { start_prov, end_prov } = req.query;
      let data = await Trip_on.findAll({
        include: [
          {
            model: Society,
            required: false,
            attributes: ["person_name", "foto", "nik", "nationality"],
          },
          {
            model: Public_vehicle,
            required: false,
            attributes: ["no_vehicle"],
          },
          {
            model: Type_vehicle,
            required: false,
            attributes: ["type_name"],
          },
          {
            model: Brand_vehicle,
            required: false,
            attributes: ["brand_name"],
          },
          {
            model: Passenger_trip_on,
            required: false,
            attributes: ["name", "nationality", "nik"],
          },
        ],
        where: {
          // kode_prov_start: start_prov,
          // kode_prov_end: end_prov,
          [Op.and]: [
            { kode_prov_start: start_prov },
            { kode_prov_end: end_prov },
          ],
        },
      });
      response(res, true, "Succeed", data);
    } catch (error) {
      response(res, false, "Failed", error.message);
    }
  };
};
