const { AESEncrypt, AESDecrypt } = require("../lib/encryption");
const response = require("../lib/response");
const Schedule = require("../model/schedule");
const Account = require("../model/account");
const Vip = require("../model/vip");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const db = require("../config/database");
const field = {
  activity: null,
  id_vip: null,
  id_account: null,
  date_schedule: null,
  start_time: null,
  end_time: null,
  address_schedule: null,
  coordinate_schedule: null,
  status_schedule: 0,
};
module.exports = class ScheduleController {
  static get = async (req, res) => {
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
      const modelAttr = Object.keys(Schedule.getAttributes());
      let getData = { where: null };
      if (serverSide?.toLowerCase() === "true") {
        getData.limit = length;
        getData.offset = start;
      }
      if (order <= modelAttr.length) {
        getData.order = [[modelAttr[order], orderDirection.toUpperCase()]];
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
      const dataRes = await Schedule.findAll(getData);
      const count = await Schedule.count({
        where: getData?.where,
      });

      var data = [];
      var dummyData = {};
      for (let i = 0; i < dataRes.length; i++) {
        const arrayIdVip = dataRes[i]["id_vip"].split(",");
        const dataVip = await Vip.findAll({
          where: {
            id: arrayIdVip,
          },
        });

        const arrayIdAccount = dataRes[i]["id_account"].split(",");
        const dataAccount = await Account.findAll({
          where: {
            id: arrayIdAccount,
          },
        });

        var encryptIdAccount = [];
        for (let i = 0; i < arrayIdAccount.length; i++) {
          encryptIdAccount.push(
            AESEncrypt(arrayIdAccount[i], {
              isSafeUrl: true,
              parseMode: "string",
            })
          );
        }

        var encryptIdVip = [];
        for (let i = 0; i < arrayIdVip.length; i++) {
          encryptIdVip.push(
            AESEncrypt(arrayIdVip[i], {
              isSafeUrl: true,
              parseMode: "string",
            })
          );
        }

        dummyData = {};
        dummyData["id"] = dataRes[i]["id"];
        dummyData["activity"] = dataRes[i]["activity"];
        dummyData["id_vip"] = encryptIdVip.toString();
        dummyData["id_account"] = encryptIdAccount.toString();
        dummyData["date_schedule"] = dataRes[i]["date_schedule"];
        dummyData["start_time"] = dataRes[i]["start_time"];
        dummyData["end_time"] = dataRes[i]["end_time"];
        dummyData["address_schedule"] = dataRes[i]["address_schedule"];
        dummyData["coordinate_schedule"] = dataRes[i]["coordinate_schedule"];
        dummyData["status_schedule"] = dataRes[i]["status_schedule"];
        dummyData["vips"] = dataVip;
        dummyData["accounts"] = dataAccount;

        data.push(dummyData);
      }

      // const adaw =
      //   '[{"latlong":"1.2323, -8.239393"},{"latlong":"2.2323, -9.239393"}]';
      response(res, true, "Succeed", {
        data,
        recordsFiltered: count,
        recordsTotal: count,
        // test: JSON.parse(adaw),
      });
    } catch (e) {
      response(res, false, "Failed", e.message);
    }
  };

  static getId = async (req, res) => {
    try {
      const dataRes = await Schedule.findOne({
        where: {
          id: AESDecrypt(req.params.id, {
            isSafeUrl: true,
            parseMode: "string",
          }),
        },
      });

      var data = {};

      const arrayIdVip = dataRes["id_vip"].split(",");
      const dataVip = await Vip.findAll({
        where: {
          id: arrayIdVip,
        },
      });

      const arrayIdAccount = dataRes["id_account"].split(",");
      const dataAccount = await Account.findAll({
        where: {
          id: arrayIdAccount,
        },
      });

      var encryptIdAccount = [];
      for (let i = 0; i < arrayIdAccount.length; i++) {
        encryptIdAccount.push(
          AESEncrypt(arrayIdAccount[i], {
            isSafeUrl: true,
            parseMode: "string",
          })
        );
      }

      var encryptIdVip = [];
      for (let i = 0; i < arrayIdVip.length; i++) {
        encryptIdVip.push(
          AESEncrypt(arrayIdVip[i], {
            isSafeUrl: true,
            parseMode: "string",
          })
        );
      }

      data["id"] = dataRes["id"];
      data["activity"] = dataRes["activity"];
      data["id_vip"] = encryptIdVip.toString();
      data["id_account"] = encryptIdAccount.toString();
      data["date_schedule"] = dataRes["date_schedule"];
      data["start_time"] = dataRes["start_time"];
      data["end_time"] = dataRes["end_time"];
      data["address_schedule"] = dataRes["address_schedule"];
      data["coordinate_schedule"] = dataRes["coordinate_schedule"];
      data["status_schedule"] = dataRes["status_schedule"];
      data["vips"] = dataVip;
      data["accounts"] = dataAccount;

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

      Object.keys(field).forEach((val, key) => {
        fieldValue[val] = req.body[val];
        if (req.body[val]) {
          if (val == "id_account") {
            var dataIdAccount = [];
            const arrayIdAccount = fieldValue["id_account"].split(",");
            for (let i = 0; i < arrayIdAccount.length; i++) {
              dataIdAccount.push(
                AESDecrypt(arrayIdAccount[i], {
                  isSafeUrl: true,
                  parseMode: "string",
                })
              );
            }
            fieldValue[val] = dataIdAccount.toString();
          } else if (val == "id_vip") {
            var dataIdVip = [];
            const arrayIdVip = fieldValue["id_vip"].split(",");
            for (let i = 0; i < arrayIdVip.length; i++) {
              dataIdVip.push(
                AESDecrypt(arrayIdVip[i], {
                  isSafeUrl: true,
                  parseMode: "string",
                })
              );
            }
            fieldValue[val] = dataIdVip.toString();
          }
        }
      });
      await Schedule.create(fieldValue, { transaction: transaction });
      await transaction.commit();
      response(res, true, "Succeed", null);
    } catch (e) {
      await transaction.rollback();
      response(res, false, "Failed", e.message);
    }
  };
  static edit = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let fieldValue = {};

      Object.keys(field).forEach((val, key) => {
        fieldValue[val] = req.body[val];
        if (req.body[val]) {
          if (val == "id_account") {
            var dataIdAccount = [];
            const arrayIdAccount = fieldValue["id_account"].split(",");
            for (let i = 0; i < arrayIdAccount.length; i++) {
              dataIdAccount.push(
                AESDecrypt(arrayIdAccount[i], {
                  isSafeUrl: true,
                  parseMode: "string",
                })
              );
            }
            fieldValue[val] = dataIdAccount.toString();
          } else if (val == "id_vip") {
            var dataIdVip = [];
            const arrayIdVip = fieldValue["id_vip"].split(",");
            for (let i = 0; i < arrayIdVip.length; i++) {
              dataIdVip.push(
                AESDecrypt(arrayIdVip[i], {
                  isSafeUrl: true,
                  parseMode: "string",
                })
              );
            }
            fieldValue[val] = dataIdVip.toString();
          }
        }
      });
      await Schedule.update(fieldValue, {
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
      await Schedule.update(fieldValue, {
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
      await Schedule.destroy({
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
