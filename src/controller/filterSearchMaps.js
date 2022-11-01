const { AESDecrypt } = require("../lib/encryption");
const response = require("../lib/response");
const Officer = require("../model/officer");
const db = require("../config/database");
const fs = require("fs");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const formidable = require("formidable");
const Account = require("../model/account");
const Vehicle = require("../model/vehicle");
const { Client } = require("@googlemaps/google-maps-services-js");
const pagination = require("../lib/pagination-parser");
const moment = require("moment");
const { TrackG20 } = require("../model/tracking/g20");
const Cctv = require("../model/cctv");
const Polres = require("../model/polres");
const Fasum = require("../model/fasum");
const CategoryFasum = require("../model/category_fasum");
const Schedule = require("../model/schedule");
const Panic_button = require("../model/report");
const dateParse = (date) => {
  const aaa = moment.tz(date, "Etc/GMT-5");
  return aaa.format("YYYY-MM-DD");
};
const googleMapClient = new Client();
const fieldData = {
  turjawali: async () => {
    const today = dateParse(moment());

    console.log({ today });

    let getTrack = await TrackG20.aggregate(
      [
        {
          $match: {
            dateOnly: today,
          },
        },
        {
          $group: {
            _id: "$nrp_user",
            max_date: {
              $max: "$updated_at",
            },
            // latitude: "$latitude",
            records: {
              $push: "$$ROOT",
            },
          },
        },
        {
          $project: {
            nrp_user: {
              $filter: {
                input: "$records",
                as: "records",
                cond: {
                  $eq: ["$$records.updated_at", "$max_date"],
                },
              },
            },
          },
        },
        {
          $replaceRoot: {
            newRoot: {
              results: "$nrp_user",
            },
          },
        },
      ],
      {
        allowDiskUse: true,
      }
    );
    getTrack = getTrack.map((datanya) => datanya.results[0]);

    return getTrack;
  },
  polres: async () => {
    return await Polres.findAll();
  },
  cctv: async () => {
    return await Cctv.findAll();
  },
  titik_laporan: async (req) => {
    return await Panic_button.findAll({
      include: [
        {
          model: Officer,
        },
        {
          model: Account,
          required: false,
        },
      ],
      where: {
        type: "LAP",
      },
    });
  },
  titik_panicButton: async (req) => {
    return await Panic_button.findAll({
      include: [
        {
          model: Officer,
        },
        {
          model: Account,
          required: false,
        },
      ],
      where: {
        type: "PNC",
      },
    });
  },
  fasum: async ({ type, coordinate, radius }) => {
    let tampung_nearby = [];
    for (const iterator of type.split(",")) {
      let nearby = await nearByPlacesGoogle({
        type: iterator,
        radius: radius,
        coordinate: coordinate,
      });
      tampung_nearby.push(...nearby.data.results);
    }
    return tampung_nearby;
  },
  fasum_khusus: async (req) => {
    return await Fasum.findAll({
      include: [
        {
          model: CategoryFasum,
          foreignKey: "fasum_type",
          required: false,
        },
      ],
      where: {
        fasum_type: 9,
      },
    });
  },
  cluster: async (req) => {
    return await Fasum.findAll({
      include: [
        {
          model: CategoryFasum,
          foreignKey: "fasum_type",
          required: false,
        },
      ],
      where: {
        fasum_type: 10,
      },
    });
  },
  troublespot: null,
  jadwal_kegiatan: async () => {
    return await Schedule.findAll();
  },
  operasi: null,
};

const nearByPlacesGoogle = ({ type, radius, coordinate }) => {
  return googleMapClient.placesNearby({
    params: {
      key: process.env.GOOGLE_MAPS_API_KEY,
      radius: radius,
      type: type,
      location: coordinate,
      opennow: true,
    },
  });
};

module.exports = class FilterSearchController {
  static get = async (req, res) => {
    try {
      const { filter, type, coordinate, radius } = req.query;
      let tampung = {};
      let tampungArr = [];
      Object.keys(fieldData).forEach((value, key) => {
        if (fieldData[value]) {
          if (filter.split(",").some((e) => e == value)) {
            if (value == "fasum") {
              let aaa = fieldData[value]({
                type,
                radius,
                coordinate,
              });
              tampung[value] = true;
              tampungArr.push(aaa);
            } else if (value == "titik_laporan") {
              tampung[value] = true;
              tampungArr.push(fieldData[value](req));
            } else if (value == "titik_panicButton") {
              tampung[value] = true;
              tampungArr.push(fieldData[value](req));
            } else if (value == "fasum_khusus") {
              tampung[value] = true;
              tampungArr.push(fieldData[value](req));
            } else if (value == "cluster") {
              tampung[value] = true;
              tampungArr.push(fieldData[value](req));
            } else {
              tampung[value] = true;
              tampungArr.push(fieldData[value]());
            }
          }
        } else {
          tampung[value] = true;
          tampungArr.push(fieldData[value]);
        }
      });

      Promise.all(tampungArr).then((cek) => {
        let objData = {};
        Object.keys(tampung).forEach((val, key) => {
          objData[val] = cek[key] ? cek[key] : [];
        });
        response(res, true, "Succeed", objData);
      });
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };
  static getMultiplePlace = async (req, res) => {
    try {
      const { type, coordinate } = req.query;
      // const type = "mosque,school,cafe,hospital,lodging,restaurant,tourist_attraction,fire_station,shopping_mall";
      let tampung_nearby = [];
      for (const iterator of type.split(",")) {
        let aaa = await nearByPlacesGoogle({
          type: iterator,
          radius: 1500,
          coordinate: coordinate,
        });
        tampung_nearby.push(...aaa.data.results);
      }
      response(res, true, "Success", tampung_nearby);
    } catch (e) {
      response(res, false, "Failed", e);
    }
  };
};
