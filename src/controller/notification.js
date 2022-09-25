const { AESDecrypt } = require("../lib/encryption");
const response = require("../lib/response");
const Notifikasi = require("../model/notifikasi");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const db = require("../config/database");
const pagination = require("../lib/pagination-parser");
const { default: axios } = require("axios");
const TokenTrackNotif = require("../model/token_track_notif");

const fieldData = Object.keys(Notifikasi.getAttributes());
module.exports = class NotifikasiController {
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
      const modelAttr = Object.keys(Notifikasi.getAttributes());
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
      const data = await Notifikasi.findAll(getData);
      const count = await Notifikasi.count({
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
  static addGlobal = async (
    data = {
      deepLink,
      type,
      title,
      description,
      officer_id,
      mobile,
      web,
      to,
    }
  ) => {
    const transaction = await db.transaction();
    try {
      //   "eldsqKJHTFeHj1oW0byUtg:APA91bHq0vnBdPOICdAwFEupkQPHWgCJxjZnTCDxBdB-vOKdRGI86Pdat7G9CiEDIaUZslQqgpmUmhB5fSrUSAcDBt55muH_x_9uKox46AfS1xzFOd6WSo9JrezwxlaM78rLmVL2N_TZ"
      let dataProcess = await axios({
        url: "https://fcm.googleapis.com/fcm/send",
        method: "POST",
        headers: {
          Authorization:
            "key=AAAAbpmRKpI:APA91bFQeeeQOxnL211jLnBoHzbOp0WcVJvOT3eu98U5DL11d7EJl83eBAks5VH3Om3zwgCOR1dVD2xyT4oUHdMYA4Yf64sSE4pubJejWM-nQA227CpfJeWHjp8IS8Fx9qUyxdVRH7_K",
          "Content-Type": "application/json",
        },
        data: {
          to: data.to,
          notification: {
            body: data.description,
            title: data.title,
          },
          data: {
            deepLink: data.mobile,
            webLink: data.web,
          },
        },
      });
      console.log({ dataProcess });
      await transaction.commit();
      const creteNotif = await Notifikasi.create({
        type: data.type,
        title: data.title,
        description: data.description,
        officer_id: data.officer_id,
        mobile: data.mobile,
        web: data.web,
      });
      return {
        // notif: dataProcess.data,
        notifDatabase: creteNotif,
      };
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };
  static add = async (req, res) => {
    // const transaction = await db.transaction();
    try {
      //   let fieldValueData = {};
      //   const modelAttr = Object.keys(Notifikasi.getAttributes());
      //   Object.keys(modelAttr).forEach((key) => {
      //     if (req.body[key]) {
      //       fieldValueData[key] = req.body[key];
      //     } else {
      //       fieldValueData[key] = null;
      //     }
      //   });

      //   let op = await Notifikasi.create(fieldValueData, {
      //     transaction: transaction,
      //   });
      let data = await axios({
        url: "https://fcm.googleapis.com/fcm/send",
        method: "POST",
        headers: {
          Authorization:
            "key=AAAAbpmRKpI:APA91bFQeeeQOxnL211jLnBoHzbOp0WcVJvOT3eu98U5DL11d7EJl83eBAks5VH3Om3zwgCOR1dVD2xyT4oUHdMYA4Yf64sSE4pubJejWM-nQA227CpfJeWHjp8IS8Fx9qUyxdVRH7_K",
          "Content-Type": "application/json",
        },
        data: {
          to: "eldsqKJHTFeHj1oW0byUtg:APA91bHq0vnBdPOICdAwFEupkQPHWgCJxjZnTCDxBdB-vOKdRGI86Pdat7G9CiEDIaUZslQqgpmUmhB5fSrUSAcDBt55muH_x_9uKox46AfS1xzFOd6WSo9JrezwxlaM78rLmVL2N_TZ",
          collapse_key: "type_a",
          notification: {
            body: "Body of Your Notification",
            title: "Title of Your Notification",
          },
          data: {
            body: "Body of Your Notification in Data",
            title: "Title of Your Notification in Title",
            key_1: "Value for key_1",
            key_2: "Value for key_2",
            deepLink:
              "korlantasg20://halaman/drawer/laporan/utama/{oke bismillah}",
          },
        },
      });
      //   await transaction.commit();
      console.log({ data });
      response(res, true, "Succeed", data.data);
    } catch (e) {
      //   await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };
  static edit = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let fieldValueData = {};
      Object.keys(fieldData).forEach((key) => {
        if (req.body[key]) {
          fieldValueData[key] = req.body[key];
        } else {
          fieldValueData[key] = null;
        }
      });

      await Notifikasi.update(fieldValueData, {
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
      await Notifikasi.destroy({
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
