const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const Input_laka_langgar = require("../model/input_laka_langgar");
const count_day_polda_laka_langgar = require("../model/count_day_polda_laka_langgar");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");

const Count_polda_day = require("../model/count_lakalanggar_polda_day");
const Count_polda_month = require("../model/count_lakalanggar_polda_month");
const Count_polres_month = require("../model/count_lakalanggar_polres_month");
const Polda = require("../model/polda");
const Polres = require("../model/polres");

// Count_polda_month.belongsTo(Polda, { foreignKey: "polda_id", as: "polda" });
// Count_polda_day.belongsTo(Polda, { foreignKey: "polda_id", as: "polda" });
Polda.hasMany(Count_polda_day, { foreignKey: "polda_id", as: "laka_langgar" });
Polda.hasMany(Count_polda_month, {
  foreignKey: "polda_id",
  as: "laka_langgar-month",
});
// Count_polres_month.belongsTo(Polda, { foreignKey: "polda_id", as: "polda" });
// Count_polres_month.belongsTo(Polres, { foreignKey: "polres_id", as: "polres" });
const decAes = (token) =>
  AESDecrypt(token, {
    isSafeUrl: true,
    parseMode: "string",
  });
module.exports = class LakaLanggarController {
  static get_daily = async (req, res) => {
    const modelAttr = Object.keys(Count_polda_day.getAttributes());
    try {
      const {
        start_date = null,
        end_date = null,
        filter = null,
        date = null,
        serverSide = null,
        length = null,
        start = null,
        polda_id = null,
        topPolda = null,
        limit = 34,
      } = req.query;
      const getDataRules = {
        group: ["polda.id"],
        attributes: [
          "id",
          "name_polda",
          [
            Sequelize.fn("sum", Sequelize.col("capture_camera")),
            "capture_camera",
          ],
          [Sequelize.fn("sum", Sequelize.col("statis")), "statis"],
          [Sequelize.fn("sum", Sequelize.col("posko")), "posko"],
          [Sequelize.fn("sum", Sequelize.col("mobile")), "mobile"],
          [Sequelize.fn("sum", Sequelize.col("online")), "online"],
          [Sequelize.fn("sum", Sequelize.col("preemtif")), "preemtif"],
          [Sequelize.fn("sum", Sequelize.col("preventif")), "preventif"],
          [Sequelize.fn("sum", Sequelize.col("odol_227")), "odol_227"],
          [Sequelize.fn("sum", Sequelize.col("odol_307")), "odol_307"],
          [
            Sequelize.literal(
              "SUM(capture_camera + statis + posko + mobile +  online + preemtif + preventif + odol_227 + odol_307)"
            ),
            "total",
          ],
        ],
        include: [
          {
            model: Count_polda_day,
            required: false,
            as: "laka_langgar",
            attributes: [],
          },
        ],
        nest: true,
        subQuery: false,
      };

      if (date) {
        getDataRules.include[0].where = {
          date: date,
        };
      }

      if (filter) {
        getDataRules.include[0].where = {
          date: {
            [Op.between]: [start_date, end_date],
          },
        };
      }

      if (polda_id) {
        getDataRules.where = {
          id: decAes(polda_id),
        };
      }

      if (serverSide?.toLowerCase() === "true") {
        getDataRules.limit = length;
        getDataRules.offset = start;
      }

      let finals = await Polda.findAll(getDataRules);
      const count = await Polda.count({
        where: getDataRules?.where,
      });

      let rows = [];

      finals.map((element, index) => {
        rows.push({
          id: element.id,
          name_polda: element.name_polda,
          capture_camera: parseInt(element.dataValues.capture_camera) || 0,
          statis: parseInt(element.dataValues.statis) || 0,
          mobile: parseInt(element.dataValues.mobile) || 0,
          online: parseInt(element.dataValues.online) || 0,
          posko: parseInt(element.dataValues.posko) || 0,
          preemtif: parseInt(element.dataValues.preemtif) || 0,
          preventif: parseInt(element.dataValues.preventif) || 0,
          odol_227: parseInt(element.dataValues.odol_227) || 0,
          odol_307: parseInt(element.dataValues.odol_307) || 0,
          total: parseInt(element.dataValues.total) || 0,
        });
      });

      if (topPolda) {
        rows.sort((a, b) => b.total - a.total);
        rows = rows.slice(0, limit);
      }
      response(res, true, "Succeed", {
        rows,
        recordsFiltered: count,
        recordsTotal: count,
      });
    } catch (error) {
      response(res, false, "Failed", error.message);
    }
  };
  static get_monthly = async (req, res) => {
    const modelAttr = Object.keys(Count_polda_day.getAttributes());
    try {
      const {
        start_month = null,
        end_month = null,
        filter = null,
        month = null,
        serverSide = null,
        length = null,
        start = null,
        polda_id = null,
        topPolda = null,
        limit = 34,
      } = req.query;
      const getDataRules = {
        group: ["polda.id"],
        attributes: [
          "id",
          "name_polda",
          [
            Sequelize.fn("sum", Sequelize.col("capture_camera")),
            "capture_camera",
          ],
          [Sequelize.fn("sum", Sequelize.col("statis")), "statis"],
          [Sequelize.fn("sum", Sequelize.col("posko")), "posko"],
          [Sequelize.fn("sum", Sequelize.col("mobile")), "mobile"],
          [Sequelize.fn("sum", Sequelize.col("online")), "online"],
          [Sequelize.fn("sum", Sequelize.col("preemtif")), "preemtif"],
          [Sequelize.fn("sum", Sequelize.col("preventif")), "preventif"],
          [Sequelize.fn("sum", Sequelize.col("odol_227")), "odol_227"],
          [Sequelize.fn("sum", Sequelize.col("odol_307")), "odol_307"],
          [
            Sequelize.literal(
              "SUM(capture_camera + statis + posko + mobile + online + preemtif + preventif + odol_227 + odol_307)"
            ),
            "total",
          ],
        ],
        include: [
          {
            model: Count_polda_month,
            required: false,
            as: "laka_langgar-month",
            attributes: [],
          },
        ],
        nest: true,
        subQuery: false,
      };

      if (month) {
        getDataRules.include[0].where = {
          date: month,
        };
      }

      if (filter) {
        getDataRules.include[0].where = {
          date: {
            [Op.between]: [start_month, end_month],
          },
        };
      }

      if (polda_id) {
        getDataRules.where = {
          id: decAes(polda_id),
        };
      }

      if (serverSide?.toLowerCase() === "true") {
        getDataRules.limit = length;
        getDataRules.offset = start;
      }

      let finals = await Polda.findAll(getDataRules);
      const count = await Polda.count({
        where: getDataRules?.where,
      });

      let rows = [];

      finals.map((element, index) => {
        rows.push({
          id: element.id,
          name_polda: element.name_polda,
          capture_camera: parseInt(element.dataValues.capture_camera) || 0,
          statis: parseInt(element.dataValues.statis) || 0,
          posko: parseInt(element.dataValues.posko) || 0,
          mobile: parseInt(element.dataValues.mobile) || 0,
          online: parseInt(element.dataValues.online) || 0,
          preemtif: parseInt(element.dataValues.preemtif) || 0,
          preventif: parseInt(element.dataValues.preventif) || 0,
          odol_227: parseInt(element.dataValues.odol_227) || 0,
          odol_307: parseInt(element.dataValues.odol_307) || 0,
          total: parseInt(element.dataValues.total) || 0,
        });
      });

      if (topPolda) {
        rows.sort((a, b) => b.total - a.total);
        rows = rows.slice(0, limit);
      }
      response(res, true, "Succeed", {
        rows,
        recordsFiltered: count,
        recordsTotal: count,
      });
    } catch (error) {
      response(res, false, "Failed", error.message);
    }
  };

  static get_by_date = async (req, res) => {
    let start_of_month = moment().startOf("years").format("YYYY-MM-DD");
    let end_of_month = moment().endOf("years").format("YYYY-MM-DD");

    let start_of_day = moment().startOf("month").format("YYYY-MM-DD");
    let end_of_day = moment().endOf("month").format("YYYY-MM-DD");
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
        limit = 5
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
      if (date) {
        wheres.date = date;
      }

      if (filter) {
        wheres.date = {
          [Op.between]: [start_date, end_date],
        };
      }

      if (polda_id) {
        wheres.polda_id = decAes(polda_id);
      }

      const getDataRules = {
        attributes: [
          [
            Sequelize.fn("sum", Sequelize.col("capture_camera")),
            "capture_camera",
          ],
          [Sequelize.fn("sum", Sequelize.col("statis")), "statis"],
          [Sequelize.fn("sum", Sequelize.col("mobile")), "mobile"],
          [Sequelize.fn("sum", Sequelize.col("online")), "online"],
          [Sequelize.fn("sum", Sequelize.col("posko")), "posko"],
          [Sequelize.fn("sum", Sequelize.col("preemtif")), "preemtif"],
          [Sequelize.fn("sum", Sequelize.col("preventif")), "preventif"],
          [Sequelize.fn("sum", Sequelize.col("odol_227")), "odol_227"],
          [Sequelize.fn("sum", Sequelize.col("odol_307")), "odol_307"],
        ],
        where: wheres,
      };

      if (type === "day") {
        getDataRules.group = "date";
        getDataRules.attributes.push("date");
      } else if (type === "month") {
        getDataRules.group = "month";
        getDataRules.attributes.push([
          Sequelize.fn("date_trunc", "month", Sequelize.col("date")),
          "month",
        ]);
      }

      let rows = await Count_polda_day.findAll(getDataRules);

      let finals = [];
      if (type === "day") {
        const asd = list_day.map((item, index) => {
          const data = rows.find((x) => x.dataValues.date == item);
          if (data) {
            finals.push({
              capture_camera: parseInt(data.capture_camera),
              mobile: parseInt(data.mobile),
              statis: parseInt(data.statis),
              online: parseInt(data.online),
              posko: parseInt(data.online),
              preemtif: parseInt(data.online),
              preventif: parseInt(data.online),
              odol_227: parseInt(data.online),
              odol_307: parseInt(data.online),
              date: data.date,
            });
          } else {
            finals.push({
              capture_camera: 0,
              mobile: 0,
              statis: 0,
              online: 0,
              posko: 0,
              preemtif: 0,
              preventif: 0,
              odol_227: 0,
              odol_307: 0,
              date: item,
            });
          }
        });
      } else if (type === "month") {
        let abc = rows.map((element, index) => {
          return {
            capture_camera: parseInt(element.dataValues.capture_camera),
            mobile: parseInt(element.dataValues.mobile),
            statis: parseInt(element.dataValues.statis),
            online: parseInt(element.dataValues.online),
            posko: parseInt(element.dataValues.posko),
            preemtif: parseInt(element.dataValues.preemtif),
            preventif: parseInt(element.dataValues.preventif),
            odol_227: parseInt(element.dataValues.odol_227),
            odol_307: parseInt(element.dataValues.odol_307),
            date: moment(element.dataValues.month).format("MMMM"),
          };
        });

        const asd = list_month.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              capture_camera: parseInt(data.capture_camera),
              mobile: parseInt(data.mobile),
              statis: parseInt(data.statis),
              online: parseInt(data.online),
              posko: parseInt(data.posko),
              preemtif: parseInt(data.preemtif),
              preventif: parseInt(data.preventif),
              odol_227: parseInt(data.odol_227),
              odol_307: parseInt(data.odol_307),
              date: data.date,
            });
          } else {
            finals.push({
              capture_camera: 0,
              mobile: 0,
              statis: 0,
              online: 0,
              posko: 0,
              preemtif: 0,
              preventif: 0,
              odol_227: 0,
              odol_307: 0,
              date: item,
            });
          }
        });
      }
      response(res, true, "Succeed", finals);
    } catch (error) {
      response(res, false, "Failed", error.message);
    }
  };

  // static add = async (req, res) => {
  //   const transaction = await db.transaction();
  //   try {
  //     const { polda } = req.query;
  //     if (polda) {
  //       let dataInputPolda = [];
  //       req.body?.value.map((item) => {
  //         dataInputPolda.push({
  //           polda_id: decAes(req.body.polda_id),
  //           date: req.body.date,
  //           polres_id: decAes(item.polres_id),
  //           capture_camera: item.capture_camera,
  //           online: item.online,
  //           mobile: item.mobile,
  //           posko: item.posko,
  //           statis: item.statis,
  //           preemtif: item.preemtif,
  //           preventif: item.preventif,
  //           odol_227: item.odol_227,
  //           odol_307: item.odol_307,
  //         });
  //       });
  //       let insertDataPolda = await Input_laka_langgar.bulkCreate(
  //         dataInputPolda,
  //         { transaction: transaction }
  //       );
  //     } else {
  //       let checkData = await Input_laka_langgar.findOne({
  //         where: {
  //           polda_id: decAes(req.body.polda_id),
  //           polres_id: decAes(req.body.polres_id),
  //           date: req.body.date,
  //         },
  //       });
  //       let inputData = {
  //         polda_id: decAes(req.body.polda_id),
  //         polres_id: decAes(req.body.polres_id),
  //         date: req.body.date,
  //         capture_camera: req.body.capture_camera,
  //         online: req.body.online,
  //         mobile: req.body.mobile,
  //         posko: req.body.posko,
  //         statis: req.body.statis,
  //         preemtif: req.body.preemtif,
  //         preventif: req.body.preventif,
  //         odol_227: req.body.odol_227,
  //         odol_307: req.body.odol_307,
  //       };
  //       if (checkData) {
  //         let updateData = await Input_laka_langgar.update(inputData, {
  //           where: {
  //             polda_id: decAes(req.body.polda_id),
  //             polres_id: decAes(req.body.polres_id),
  //             date: req.body.date,
  //           },
  //         });
  //       } else {
  //         let insertData = await Input_laka_langgar.create(inputData, {
  //           transaction: transaction,
  //         });
  //       }
  //     }
  //     await transaction.commit();
  //     response(res, true, "Succeed", null);
  //   } catch (error) {
  //     await transaction.rollback();
  //     response(res, false, "Failed", error.message);
  //   }
  // };

  static add = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let dataInputPolda = [];
      req.body?.value.map((item) => {
        dataInputPolda.push({
          polda_id: decAes(item.polda_id),
          date: item.date,
          capture_camera: item.capture_camera,
          online: item.online,
          mobile: item.mobile,
          posko: item.posko,
          statis: item.statis,
          preemtif: item.preemtif,
          preventif: item.preventif,
          odol_227: item.odol_227,
          odol_307: item.odol_307,
        });
      });

      let insertDataPolda = await Count_polda_day.bulkCreate(dataInputPolda, {
        transaction: transaction,
      });

      await transaction.commit();
      response(res, true, "Succeed", null);
    } catch (error) {
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };
};
