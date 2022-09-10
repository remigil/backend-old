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
const Schedule = require("../model/schedule");

const googleMapClient = new Client();
const fieldData = {
  turjawali: async () => {
    const today = moment().format("YYYY-MM-DD");
    const endDateToday = moment(today).endOf("day").toDate();

    const getTrack = await TrackG20.find({
      date: {
        $gte: today,
        $lte: endDateToday,
      },
    }).sort({ updated_at: -1 });

    let track = getTrack.reduce((group, product) => {
      const { nrp_user } = product;
      group[nrp_user] = group[nrp_user] ?? [];
      group[nrp_user].push(product);
      return group;
    }, {});

    let valueData = [];
    Object.keys(track).forEach((val, key) => {
      valueData.push(
        track[val].sort(function (a, b) {
          var dateA = new Date(a.date_prop).getTime();
          var dateB = new Date(b.date_prop).getTime();
          return dateA < dateB ? -1 : 1;
        })[0]
      );
    });
    return valueData;
  },
  polres: async () => {
    return await Polres.findAll();
  },
  cctv: async () => {
    return await Cctv.findAll();
  },
  titik_laporan: null,
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
