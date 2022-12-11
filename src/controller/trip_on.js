const db = require("../config/database");
const response = require("../lib/response");
const Trip_on = require("../model/trip_on");
const { Op, Sequelize, col } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const fs = require("fs");
const Passenger_trip_on = require("../model/passenger_trip_on");
const Society = require("../model/society");
const Public_vehicle = require("../model/public_vehicle");
const { decimalToHex } = require("../middleware/decimaltohex");
const { timeConvert } = require("../middleware/timeConvert");
const moment = require("moment");
const codeTripon = require("../middleware/codeTripon");
const Type_vehicle = require("../model/type_vehicle");
const Brand_vehicle = require("../model/brand_vehicle");
const qrcode = require("qrcode");
const { default: axios } = require("axios");
const TimeAgo = require("javascript-time-ago");
const pagination = require("../lib/pagination-parser");
const direction_route = require("../middleware/direction_route");
const geocode = require("../middleware/geocode");
const { groupBy } = require("lodash");

// Indo.
const en = require("javascript-time-ago/locale/id");
// TimeAgo.addDefaultLocale(en);
TimeAgo.setDefaultLocale(en.locale);
TimeAgo.addLocale(en);
const timeAgo = new TimeAgo("id-ID");
let typeTripOn = {
  code: null,
  user_id: null,
  vehicle_id: null,
  brand_id: null,
  type_id: null,
  distance: null,
  duration: null,
  departure_date: null,
  departure_time: null,
  start_coordinate: null,
  end_coordinate: null,
  district_start: null,
  province_start: null,
  district_end: null,
  province_end: null,
  route: null,
  validity_period: null,
  barcode: null,
};

Trip_on.hasMany(Passenger_trip_on, { foreignKey: "trip_on_id" });

const decAes = (token) =>
  AESDecrypt(token, {
    isSafeUrl: true,
    parseMode: "string",
  });
module.exports = class Trip_onController {
  static get = async (req, res) => {
    try {
      let { limit, page } = req.query;
      page = page ? parseInt(page) : 1;
      const resPage = pagination.getPagination(limit, page);
      const trip_on = await Trip_on.findAndCountAll({
        order: [["created_at", "DESC"]],
        // raw: true,
        nest: true,
        limit: resPage.limit,
        offset: resPage.offset,

        include: [
          {
            model: Society,
            attributes: ["person_name", "foto", "nik", "nationality"],
          },
          {
            model: Public_vehicle,
            attributes: ["no_vehicle"],
          },
          {
            model: Type_vehicle,
            attributes: ["type_name"],
          },
          {
            model: Brand_vehicle,
            attributes: ["brand_name"],
          },
          {
            model: Passenger_trip_on,
            // required: true,
            attributes: ["name", "nationality", "nik"],
          },
        ],
      });

      // console.log(trip_on);
      response(res, true, "Succeed", {
        limit,
        page,
        total_page: Math.ceil(
          parseInt(trip_on.count) / parseInt(resPage.limit)
        ),
        recordsFiltered: trip_on.count,
        recordsTotal: trip_on.count,
        ...trip_on,

        // groupedData,
      });
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };

  static getId = async (req, res) => {
    try {
      let data = [];
      data = await Trip_on.findOne({
        where: {
          id: AESDecrypt(req.params.id, {
            isSafeUrl: true,
            parseMode: "string",
          }),
        },
        include: [
          {
            model: Society,
            attributes: ["person_name", "foto", "nik", "nationality"],
          },
          {
            model: Public_vehicle,
            attributes: ["no_vehicle"],
          },
          {
            model: Type_vehicle,
            attributes: ["type_name"],
          },
          {
            model: Brand_vehicle,
            attributes: ["brand_name"],
          },
          {
            model: Passenger_trip_on,
            // required: true,
            attributes: ["name", "nationality", "nik"],
          },
        ],
      });
      let countpassenger = data.dataValues.passenger_trip_ons.length;
      let asd = new Date(data.dataValues.validity_period);
      let validity_period = timeAgo.format(asd);
      response(res, true, "Succeed", {
        data,
        validity_period,
        countpassenger,
      });
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };

  static getbycodetripon = async (req, res) => {
    try {
      let data = [];
      data = await Trip_on.findOne({
        where: {
          code: req.body.code,
        },
        include: [
          {
            model: Society,
            attributes: ["person_name", "foto", "nik", "nationality"],
          },
          {
            model: Public_vehicle,
            attributes: ["no_vehicle"],
          },
          {
            model: Type_vehicle,
            attributes: ["type_name"],
          },
          {
            model: Brand_vehicle,
            attributes: ["brand_name"],
          },
          {
            model: Passenger_trip_on,
            // required: true,
            attributes: ["name", "nationality", "nik"],
          },
        ],
      });
      let countpassenger = data.dataValues.passenger_trip_ons.length;
      let asd = new Date(data.dataValues.validity_period);
      let validity_period = timeAgo.format(asd);
      response(res, true, "Succeed", {
        data,
        validity_period,
        countpassenger,
      });
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };

  static gethistorybySocietyId = async (req, res) => {
    try {
      let { limit, page, order } = req.query;
      let orderby = order ? order.toUpperCase() : "";
      page = page ? parseInt(page) : 1;
      const resPage = pagination.getPagination(limit, page);
      const tripon = await Trip_on.findAndCountAll({
        where: {
          user_id: AESDecrypt(req.auth.uid, {
            isSafeUrl: true,
            parseMode: "string",
          }),
        },
        order: [["created_at", orderby == "ASC" ? "ASC" : "DESC"]],
        // raw: true,
        nest: true,
        limit: resPage.limit,
        offset: resPage.offset,
        include: [
          {
            model: Society,
            attributes: ["person_name", "foto", "nik", "nationality"],
          },
          {
            model: Public_vehicle,
            attributes: ["no_vehicle"],
          },
          {
            model: Type_vehicle,
            attributes: ["type_name"],
          },
          {
            model: Brand_vehicle,
            attributes: ["brand_name"],
          },
          {
            model: Passenger_trip_on,
            attributes: ["name", "nationality", "nik"],
          },
        ],
      });
      let rows = tripon.rows;
      let date = groupBy(rows, (list) => list.created_at);
      let datanya = [];
      Object.keys(date).forEach((listDate) => {
        var newa = new Date(listDate);
        let newdate = newa.toISOString().replace("Z", "").replace("T", " ");
        let newdatea = newdate.substring(0, 10);
        datanya.push({
          date: newdatea,
          data: date[listDate],
        });
      });
      response(res, true, "Succeed", {
        limit,
        page,
        total_page: Math.ceil(parseInt(tripon.count) / parseInt(resPage.limit)),
        recordsFiltered: tripon.count,
        recordsTotal: tripon.count,
        datanya,
      });
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };
  static getbySocietyId = async (req, res) => {
    try {
      const data = await Trip_on.findAll({
        where: {
          user_id: AESDecrypt(req.auth.uid, {
            isSafeUrl: true,
            parseMode: "string",
          }),
        },
        order: [["created_at", "DESC"]],
        include: [
          {
            model: Society,
            attributes: ["person_name", "foto", "nik", "nationality"],
          },
          {
            model: Public_vehicle,
            attributes: ["no_vehicle"],
          },
          {
            model: Type_vehicle,
            attributes: ["type_name"],
          },
          {
            model: Brand_vehicle,
            attributes: ["brand_name"],
          },
          {
            model: Passenger_trip_on,
            // required: true,
            attributes: ["name", "nationality", "nik"],
          },
        ],
      });
      response(res, true, "Succeed", {
        data,
      });
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };

  static cekTripon = async (req, res) => {
    try {
      let HariIni = Date.now() + 7 * 60 * 60 * 1000;
      let asd = new Date(HariIni);
      let SaatIni = asd.toISOString().replace("Z", "").replace("T", " ");
      const data = await Trip_on.findOne({
        where: {
          user_id: AESDecrypt(req.auth.uid, {
            isSafeUrl: true,
            parseMode: "string",
          }),
          validity_period: {
            [Op.gt]: SaatIni,
          },
        },
        order: [["id", "DESC"]],

        include: [
          {
            model: Society,
            attributes: ["person_name", "foto", "nik", "nationality"],
          },
          {
            model: Public_vehicle,
            attributes: ["no_vehicle"],
          },
          {
            model: Type_vehicle,
            attributes: ["type_name"],
          },
          {
            model: Brand_vehicle,
            attributes: ["brand_name"],
          },
          {
            model: Passenger_trip_on,
            // required: true,
            attributes: ["name", "nationality", "nik"],
          },
        ],
      });

      if (!data) {
        response(res, true, "Tidak ada TripOn yang terdaftar", null);
      } else {
        response(res, true, "Succeed", {
          data,
        });
      }
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };

  static add = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let input = {};
      let HariIni = Date.now() + 7 * 60 * 60 * 1000;
      let asd = new Date(HariIni);
      let SaatIni = asd.toISOString().replace("Z", "").replace("T", " ");
      const data = await Trip_on.findOne({
        where: {
          user_id: AESDecrypt(req.auth.uid, {
            isSafeUrl: true,
            parseMode: "string",
          }),
          validity_period: {
            [Op.gt]: SaatIni,
          },
        },
        order: [["id", "DESC"]],
      });
      // if (!data) {
      Object.keys(typeTripOn).forEach((val, key) => {
        if (req.body[val]) {
          input[val] = req.body[val];
        } else {
          input[val] = null;
        }
      });
      input["vehicle_id"] = AESDecrypt(req.body["vehicle_id"], {
        isSafeUrl: true,
        parseMode: "string",
      });

      let cekVehicle = await Public_vehicle.findOne({
        where: {
          id: input["vehicle_id"],
        },
      });
      let latstartcoor = req.body["start_coordinate"]["latitude"];
      let lngstartcoor = req.body["start_coordinate"]["longitude"];
      let latendcoor = req.body["end_coordinate"]["latitude"];
      let lngendcoor = req.body["end_coordinate"]["longitude"];
      input["brand_id"] = cekVehicle.brand_id;
      input["type_id"] = cekVehicle.type_id;
      let typeVehicle = codeTripon(cekVehicle["type_id"]);
      input["user_id"] = decAes(req.auth.uid);

      let DuaHari = HariIni + 2 * 24 * 60 * 60 * 1000;
      let new_date = new Date(DuaHari);
      var validity = new_date.toISOString().replace("Z", "").replace("T", " ");
      input["validity_period"] = validity;
      const coordinate = [
        {
          options: {},
          latLng: {
            lat: latstartcoor,
            lng: lngstartcoor,
          },
          _initHooksCalled: true,
        },
        {
          options: {},
          latLng: {
            lat: latendcoor,
            lng: lngendcoor,
          },
          _initHooksCalled: true,
        },
      ];
      const paramsgeocodestart = {
        lat: latstartcoor,
        lng: lngstartcoor,
      };
      const paramsgeocodeend = {
        lat: latendcoor,
        lng: lngendcoor,
      };

      let directions = await direction_route(coordinate);
      let geocodestart = await geocode(paramsgeocodeend);
      let geocodeend = await geocode(paramsgeocodestart);

      input["route"] = directions.route;
      input["distance"] = directions.estimasi;
      input["duration"] = directions.estimasiWaktu;
      input["province_start"] = geocodestart.province;
      input["district_start"] = geocodestart.district;
      input["province_end"] = geocodeend.province;
      input["district_end"] = geocodeend.district;
      const [provinsi_end] = await db.query(
        `SELECT * FROM provinsi WHERE lower(nama) LIKE '%${geocodeend.province.toLowerCase()}%'`
      );
      const [kabupaten_end] = await db.query(
        `SELECT * FROM kabupaten WHERE lower(nama) LIKE '%${geocodeend.district.toLowerCase()}%'`
      );
      const [provinsi_start] = await db.query(
        `SELECT * FROM provinsi WHERE lower(nama) LIKE '%${geocodestart.province.toLowerCase()}%'`
      );
      const [kabupaten_start] = await db.query(
        `SELECT * FROM kabupaten WHERE lower(nama) LIKE '%${geocodestart.district.toLowerCase()}%'`
      );
      input["kode_prov_start"] = provinsi_end.length
        ? provinsi_end[0].kode
        : "";
      input["kode_kabkot_start"] = kabupaten_end.length
        ? kabupaten_end[0].kode
        : "";
      input["kode_prov_end"] = provinsi_start.length
        ? provinsi_start[0].kode
        : "";
      input["kode_kabkot_end"] = kabupaten_start.length
        ? kabupaten_start[0].kode
        : "";

      let insertTripOn = await Trip_on.create(input, {
        transaction: transaction,
      });
      let getId = AESDecrypt(insertTripOn["id"], {
        isSafeUrl: true,
        parseMode: "string",
      });
      let tes = parseInt(getId);
      let id = decimalToHex(tes);

      let codetrp = `TRP/${moment().format("MMYY")}/${typeVehicle}/${id}`;
      qrcode.toFile(`./public/uploads/qrcode/${id}.png`, codetrp, {
        width: 300,
        height: 300,
      });
      let barcode = id + ".png";

      await Trip_on.update(
        { code: codetrp, barcode: barcode },
        {
          where: {
            id: getId,
          },
          transaction: transaction,
        }
      );

      let penumpang = req.body?.passenger?.map((data) => ({
        ...data,
        trip_on_id: decAes(insertTripOn.id),
      }));
      const insertBulkPenumpang = await Passenger_trip_on.bulkCreate(
        penumpang,
        { transaction: transaction }
      );
      await transaction.commit();
      let countpassenger = await Passenger_trip_on.count({
        where: { trip_on_id: parseInt(getId) },
      });
      let countvehicle = await Public_vehicle.count({
        where: {
          id: input["vehicle_id"],
        },
      });

      response(res, true, "Succeed", {
        ...insertTripOn.dataValues,
        code: codetrp,
        passenger: insertBulkPenumpang,
        countpassenger: countpassenger,
        countvehicle: countvehicle,
      });
      // } else {
      //   response(
      //     res,
      //     false,
      //     "Belum bisa mendaftarkan TripOn, karena masih dalam masa berlaku",
      //     null
      //   );
      // }
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };

  static edit = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let fieldValueData = {};
      Object.keys(typeTripOn).forEach((val, key) => {
        if (req.body[val]) {
          fieldValueData[val] = req.body[val];
        } else {
          fieldValueData[val] = null;
        }
      });
      await Trip_on.update(fieldValueData, {
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
      await Trip_on.update(fieldValue, {
        where: {
          id: AESDecrypt(req.body.id, {
            isSafeUrl: true,
            parseMode: "string",
          }),
        },
        transaction: transaction,
      });
      await Passenger_trip_on.update(fieldValue, {
        where: {
          trip_on_id: AESDecrypt(req.body.id, {
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
      await Trip_on.destroy({
        where: {
          id: AESDecrypt(req.body.id, {
            isSafeUrl: true,
            parseMode: "string",
          }),
        },
        transaction: transaction,
      });
      await Passenger_trip_on.destroy({
        where: {
          trip_on_id: AESDecrypt(req.body.id, {
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

  static getWeb = async (req, res) => {
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
      const modelAttr = Object.keys(Trip_on.getAttributes());
      let getDataRules = { where: null };

      getDataRules.include = [
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
      ];
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
      const data = await Trip_on.findAll(getDataRules);
      const count = await Trip_on.count({
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
};
