const { AESDecrypt, AESEncrypt } = require("../lib/encryption");
const response = require("../lib/response");
const PanicButton = require("../model/report");
const db = require("../config/database");
const fs = require("fs");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const pagination = require("../lib/pagination-parser");
const moment = require("moment");
const prefix = require("../middleware/prefix");
const codeReport = require("../middleware/codeReport");
const Officer = require("../model/officer");
const NotifikasiController = require("./notification");
const notifHandler = require("../middleware/notifHandler");
const TokenTrackNotif = require("../model/token_track_notif");
const { TrackG20 } = require("../model/tracking/g20");
const Account = require("../model/account");
const { Client } = require("@googlemaps/google-maps-services-js");
const User = require("../model/user");
const googleMapClient = new Client();
const { default: axios } = require("axios");
const fieldData = {
  code: null,
  type: null,
  foto: null,
  subject: null,
  categori: null,
  status: null,
  coordinate: null,
  description: null,
  officer_id: null,
};
const fieldDataPeringatan = {
  code: null,
  type: null,
  // foto: null,
  // subject: null,
  // categori: null,
  // status: null,
  coordinate: null,
  // description: null,
  officer_id: null,
};
const getCodeReport = async ({ monthYear, type }) => {
  let [getCode] =
    await db.query(`select count(to_char(created_at, 'MMYY')) as count  from report r
    where to_char(created_at, 'MMYY')='${monthYear}' AND type='${type}'
    group by to_char(created_at, 'MMYY')`);
  return getCode.length ? prefix(getCode[0].count) : prefix(1);
};
module.exports = class PanicButtonController {
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
      const modelAttr = Object.keys(PanicButton.getAttributes());
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
          orderDirection != null ? orderDirection : "desc",
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
      getData.include = [
        {
          model: Officer,
        },
        {
          model: Account,
          required: false,
        },
      ];
      const data = await PanicButton.findAll(getData);
      const count = await PanicButton.count({
        where: getData?.where,
      });
      // response(res, true, "Succeed", {
      //   data,
      //   recordsFiltered: count,
      //   recordsTotal: count,
      // });
      response(res, true, "Succeed", {
        data: data.map((ee) => ({
          ...ee.dataValues,
          id: AESEncrypt(String(ee.dataValues.id), {
            isSafeUrl: true,
          }),
          categori: codeReport(ee.dataValues.categori, "type"),
        })),
        recordsFiltered: count,
        recordsTotal: count,
      });
    } catch (e) {
      console.log(e);
      response(res, false, "Failed", e.message);
    }
  };

  static getId = async (req, res) => {
    try {
      const data = await PanicButton.findOne({
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
      let fieldValueData = {};
      for (const key of Object.keys(fieldData)) {
        // console.log({ key });
        if (req.body[key]) {
          if (key == "foto") {
            let path = req.body.foto.filepath;
            let file = req.body.foto;
            let fileName = file.originalFilename;
            fs.renameSync(
              path,
              "./public/uploads/panic_button/" + fileName,
              function (err) {
                if (err) throw err;
              }
            );
            fieldValueData[key] = fileName;
          } else if (key == "coordinate") {
            let latlonData = JSON.parse(req.body[key]);

            if (latlonData.latitude == "" || latlonData.longitude == "") {
              let aa = await TrackG20.findOne({
                nrp_user: req.auth.nrp_user,
              })
                .sort({ updated_at: -1 })
                .limit(1);
              latlonData = {
                latitude: parseFloat(aa.latitude),
                longitude: parseFloat(aa.longitude),
              };
            }
            console.log(latlonData);
            fieldValueData[key] = latlonData;
          } else {
            fieldValueData[key] = req.body[key];
          }
        } else {
          fieldValueData[key] = null;
        }
      }

      fieldValueData["officer_id"] = AESDecrypt(req.auth.officer, {
        isSafeUrl: true,
        parseMode: "string",
      });
      fieldValueData["type"] = "PNC";
      let kode = await getCodeReport({
        monthYear: moment().format("MMYY"),
        type: "PNC",
      });
      let typeCode = codeReport(req.body.categori);
      let id_officer = AESDecrypt(req.auth.officer, {
        isSafeUrl: true,
        parseMode: "string",
      });
      let officerGetPolres = await Officer.findOne({
        where: {
          id: id_officer,
        },
      });
      let getCode = `PNC/${moment().format("MMYY")}/${kode}/P/${typeCode}/${
        officerGetPolres?.nrp_officer
      }`;
      fieldValueData["code"] = getCode;
      console.log({ fieldValueData });
      let op = await PanicButton.create(fieldValueData, {
        transaction: transaction,
      });
      await transaction.commit();

      TokenTrackNotif.findAll({
        where: {
          token_fcm: {
            [Op.ne]: null,
          },
        },
      }).then(async (token_fcm) => {
        let officer_id = token_fcm.map((officer) => officer.nrp_user);

        let getIdOfficer = await Officer.findAll({
          where: {
            nrp_officer: {
              [Op.in]: officer_id,
            },
          },
        });
        getIdOfficer = getIdOfficer.map((officer) => {
          return AESDecrypt(officer.id, {
            isSafeUrl: true,
            parseMode: "string",
          });
        });
        token_fcm = token_fcm.map((token) => token.token_fcm);
        NotifikasiController.addGlobal({
          deepLink: notifHandler.mobile.laporan + op.id,
          type: "laporan",
          title: "Laporan",
          description: req.body.description,
          officer_id: getIdOfficer,
          mobile: notifHandler.mobile.laporan + op.id,
          web: notifHandler.mobile.laporan + op.id,
          to: token_fcm,
        })
          .then((succ) => {
            console.log({ succ });
          })
          .catch((err) => {
            console.log({ err });
          });
        NotifikasiController.addGlobal({
          deepLink: notifHandler.mobile.panic_button + op.id,
          type: "panic_button",
          title: "Panic Button",
          description: req.body.description,
          officer_id: id_officer,
          mobile: notifHandler.mobile.panic_button + op.id,
          web: notifHandler.mobile.panic_button + op.id,
          to: token_fcm.token_fcm,
        })
          .then(() => {})
          .catch(() => {});
      });
      googleMapClient
        .reverseGeocode({
          params: {
            key: process.env.GOOGLE_MAPS_API_KEY,
            latlng: {
              latitude: fieldValueData["coordinate"].latitude,
              longitude: fieldValueData["coordinate"].longitude,
            },
            result_type: [
              "administrative_area_level_1",
              "administrative_area_level_2",
              "administrative_area_level_3",
              "administrative_area_level_4",
              "administrative_area_level_5",
              "administrative_area_level_6",
              "administrative_area_level_7",
            ],
          },
        })
        .then(async (resGeocode) => {
          const compondeCode = resGeocode.data.plus_code.compound_code;
          await PanicButton.update(
            {
              address: compondeCode,
            },
            {
              where: {
                id: AESDecrypt(op.id, {
                  isSafeUrl: true,
                  parseMode: "string",
                }),
              },
            }
          );
        });
      response(res, true, "Succeed", fieldValueData);
    } catch (e) {
      console.log({ e });
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };
  static addPeringatan = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let fieldValueData = {};
      for (const key of Object.keys(fieldDataPeringatan)) {
        if (req.body[key]) {
          if (key == "coordinate") {
            let latlonData = JSON.parse(req.body[key]);

            if (latlonData.latitude == "" || latlonData.longitude == "") {
              let aa = await TrackG20.findOne({
                nrp_user: req.auth.nrp_user,
              })
                .sort({ updated_at: -1 })
                .limit(1);
              latlonData = {
                latitude: parseFloat(aa.latitude),
                longitude: parseFloat(aa.longitude),
              };
            }
            fieldValueData[key] = latlonData;
          } else {
            fieldValueData[key] = req.body[key];
          }
        } else {
          fieldValueData[key] = null;
        }
      }

      fieldValueData["officer_id"] = AESDecrypt(req.auth.officer, {
        isSafeUrl: true,
        parseMode: "string",
      });
      fieldValueData["type"] = "PNC";
      let address = new Promise((resolve, reject) => {
        googleMapClient
          .reverseGeocode({
            params: {
              key: process.env.GOOGLE_MAPS_API_KEY,
              latlng: {
                latitude: fieldValueData["coordinate"].latitude,
                longitude: fieldValueData["coordinate"].longitude,
              },
              result_type: [
                "administrative_area_level_1",
                "administrative_area_level_2",
                "administrative_area_level_3",
                "administrative_area_level_4",
                "administrative_area_level_5",
                "administrative_area_level_6",
                "administrative_area_level_7",
              ],
            },
          })
          .then(async (resGeocode) => {
            const compondeCode = resGeocode.data.plus_code.compound_code;
            resolve(compondeCode);
          });
      });
      fieldValueData["address"] = await address;
      let op = await PanicButton.create(fieldValueData, {
        transaction: transaction,
      });
      await transaction.commit();
      User.findAll({
        where: {
          token_notif: {
            [Op.ne]: null,
          },
        },
      }).then(async (ress) => {
        for (let i = 0; i < ress.length; i++) {
          axios({
            url: "https://fcm.googleapis.com/fcm/send",
            method: "POST",
            headers: {
              Authorization:
                "key=AAAAbpmRKpI:APA91bFQeeeQOxnL211jLnBoHzbOp0WcVJvOT3eu98U5DL11d7EJl83eBAks5VH3Om3zwgCOR1dVD2xyT4oUHdMYA4Yf64sSE4pubJejWM-nQA227CpfJeWHjp8IS8Fx9qUyxdVRH7_K",
              "Content-Type": "application/json",
            },
            data: {
              to: ress[i]["token_notif"],
              notification: {
                body: await address,
                title: "Panic button",
                click_action: notifHandler.web.panic_button + op.id,
              },
              data: {
                webLink: notifHandler.web.panic_button + op.id,
              },
            },
          })
            .then((succ) => {
              console.log({ succ: succ.data });
            })
            .catch((err) => {
              console.log({ err });
            });
        }
      });
      response(res, true, "Succeed", op);
    } catch (e) {
      console.log({ e });
      // await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };

  static edit = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let fieldValueData = {};
      Object.keys(fieldData).forEach((key) => {
        if (req.body[key]) {
          if (key == "photo_officer") {
            let path = req.body.photo_officer.filepath;
            let file = req.body.photo_officer;
            let fileName = file.originalFilename;
            fs.renameSync(
              path,
              "./public/uploads/officer/" + fileName,
              function (err) {
                if (err) throw err;
              }
            );
            fieldValueData[key] = fileName;
          } else {
            fieldValueData[key] = req.body[key];
          }
        } else {
          fieldValueData[key] = null;
        }
      });

      await PanicButton.update(fieldValueData, {
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
      await PanicButton.destroy({
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
