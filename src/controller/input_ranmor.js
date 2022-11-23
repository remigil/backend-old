const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const Input_ranmor = require("../model/input_ranmor");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");

const Count_polda_day = require("../model/count_ranmor_polda_day");
const Count_polda_month = require("../model/count_ranmor_polda_month");
const Count_polres_month = require("../model/count_ranmor_polres_month");
const Polda = require("../model/polda");
const Polres = require("../model/polres");

// Count_polda_month.belongsTo(Polda, { foreignKey: "polda_id", as: "polda" });
// Count_polda_day.belongsTo(Polda, { foreignKey: "polda_id", as: "polda" });
Polda.hasMany(Count_polda_day, { foreignKey: "polda_id", as: "ranmor" });
Polda.hasMany(Count_polda_month, {
  foreignKey: "polda_id",
  as: "ranmor-month",
});
// Count_polres_month.belongsTo(Polda, { foreignKey: "polda_id", as: "polda" });
// Count_polres_month.belongsTo(Polres, { foreignKey: "polres_id", as: "polres" });

const decAes = (token) =>
  AESDecrypt(token, {
    isSafeUrl: true,
    parseMode: "string",
  });

module.exports = class RanmorController {
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
            Sequelize.fn("sum", Sequelize.col("mobil_penumpang")),
            "mobil_penumpang",
          ],
          [Sequelize.fn("sum", Sequelize.col("mobil_barang")), "mobil_barang"],
          [Sequelize.fn("sum", Sequelize.col("mobil_bus")), "mobil_bus"],
          [Sequelize.fn("sum", Sequelize.col("ransus")), "ransus"],
          [Sequelize.fn("sum", Sequelize.col("sepeda_motor")), "sepeda_motor"],
          [
            Sequelize.literal(
              "SUM(mobil_penumpang + mobil_barang + mobil_bus + ransus + sepeda_motor)"
            ),
            "total",
          ],
        ],
        include: [
          {
            model: Count_polda_day,
            required: false,
            as: "ranmor",
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
          mobil_penumpang: parseInt(element.dataValues.mobil_penumpang) || 0,
          mobil_barang: parseInt(element.dataValues.mobil_barang) || 0,
          mobil_bus: parseInt(element.dataValues.mobil_bus) || 0,
          ransus: parseInt(element.dataValues.ransus) || 0,
          sepeda_motor: parseInt(element.dataValues.sepeda_motor) || 0,
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
        limit = 34
      } = req.query;
      const getDataRules = {
        group: ["polda.id"],
        attributes: [
          "id",
          "name_polda",
          [
            Sequelize.fn("sum", Sequelize.col("mobil_penumpang")),
            "mobil_penumpang",
          ],
          [Sequelize.fn("sum", Sequelize.col("mobil_barang")), "mobil_barang"],
          [Sequelize.fn("sum", Sequelize.col("mobil_bus")), "mobil_bus"],
          [Sequelize.fn("sum", Sequelize.col("ransus")), "ransus"],
          [Sequelize.fn("sum", Sequelize.col("sepeda_motor")), "sepeda_motor"],
          [
            Sequelize.literal(
              "SUM(mobil_penumpang + mobil_barang + mobil_bus + ransus + sepeda_motor)"
            ),
            "total",
          ],
        ],
        include: [
          {
            model: Count_polda_month,
            required: false,
            as: "ranmor-month",
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
          mobil_penumpang: parseInt(element.dataValues.mobil_penumpang) || 0,
          mobil_barang: parseInt(element.dataValues.mobil_barang) || 0,
          mobil_bus: parseInt(element.dataValues.mobil_bus) || 0,
          ransus: parseInt(element.dataValues.ransus) || 0,
          sepeda_motor: parseInt(element.dataValues.sepeda_motor) || 0,
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
            Sequelize.fn("sum", Sequelize.col("mobil_penumpang")),
            "mobil_penumpang",
          ],
          [Sequelize.fn("sum", Sequelize.col("mobil_bus")), "mobil_bus"],
          [Sequelize.fn("sum", Sequelize.col("mobil_barang")), "mobil_barang"],
          // [Sequelize.fn("date_trunc", "month", Sequelize.col("date")), "year"],
          [Sequelize.fn("sum", Sequelize.col("sepeda_motor")), "sepeda_motor"],
          [Sequelize.fn("sum", Sequelize.col("ransus")), "ransus"],
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
              mobil_penumpang: parseInt(data.mobil_penumpang),
              mobil_barang: parseInt(data.mobil_barang),
              mobil_bus: parseInt(data.mobil_bus),
              sepeda_motor: parseInt(data.sepeda_motor),
              ransus: parseInt(data.ransus),
              date: data.date,
            });
          } else {
            finals.push({
              mobil_penumpang: 0,
              mobil_barang: 0,
              mobil_bus: 0,
              sepeda_motor: 0,
              ransus: 0,
              date: item,
            });
          }
        });
      } else if (type === "month") {
        let abc = rows.map((element, index) => {
          return {
            mobil_penumpang: parseInt(element.dataValues.mobil_penumpang),
            mobil_barang: parseInt(element.dataValues.mobil_barang),
            mobil_bus: parseInt(element.dataValues.mobil_bus),
            sepeda_motor: parseInt(element.dataValues.sepeda_motor),
            ransus: parseInt(element.dataValues.ransus),
            date: moment(element.dataValues.month).format("MMMM"),
          };
        });

        const asd = list_month.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              mobil_penumpang: parseInt(data.mobil_penumpang),
              mobil_barang: parseInt(data.mobil_barang),
              mobil_bus: parseInt(data.mobil_bus),
              sepeda_motor: parseInt(data.sepeda_motor),
              ransus: parseInt(data.ransus),
              date: data.date,
            });
          } else {
            finals.push({
              mobil_penumpang: 0,
              mobil_barang: 0,
              mobil_bus: 0,
              sepeda_motor: 0,
              ransus: 0,
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
  //           date: moment().format("YYYY-MM-DD"),
  //           polres_id: decAes(item.polres_id),
  //           mobil_penumpang: item.mobil_penumpang,
  //           mobil_barang: item.mobil_barang,
  //           mobil_bus: item.mobil_bus,
  //           ransus: item.ransus,
  //           sepeda_motor: item.sepeda_motor,
  //         });
  //       });
  //       let insertDataPolda = await Input_ranmor.bulkCreate(dataInputPolda, {
  //         fields: [
  //           "polda_id",
  //           "polres_id",
  //           "mobil_penumpang",
  //           "mobil_barang",
  //           "mobil_bus",
  //           "ransus",
  //           "sepeda_motor",
  //           "date",
  //         ],
  //         updateOnDuplicate: [
  //           "polda_id",
  //           "polres_id",
  //           "mobil_penumpang",
  //           "mobil_barang",
  //           "mobil_bus",
  //           "ransus",
  //           "sepeda_motor",
  //           "date",
  //         ],
  //         // logging: true,
  //         // ignoreDuplicates: true,
  //         transaction: transaction,
  //       });
  //     } else {
  //       let checkData = await Input_ranmor.findOne({
  //         where: {
  //           polda_id: decAes(req.body.polda_id),
  //           polres_id: decAes(req.body.polres_id),
  //           date: moment().format("YYYY-MM-DD"),
  //         },
  //       });
  //       if (checkData) {
  //         throw new Error("Data is already inputed");
  //       } else {
  //         let inputData = {
  //           polda_id: decAes(req.body.polda_id),
  //           polres_id: decAes(req.body.polres_id),
  //           date: moment().format("YYYY-MM-DD"),
  //           mobil_penumpang: req.body.mobil_penumpang,
  //           mobil_barang: req.body.mobil_barang,
  //           mobil_bus: req.body.mobil_bus,
  //           ransus: req.body.ransus,
  //           sepeda_motor: req.body.sepeda_motor,
  //         };
  //         let insertData = await Input_ranmor.create(inputData, {
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
          mobil_penumpang: item.mobil_penumpang,
          mobil_barang: item.mobil_barang,
          mobil_bus: item.mobil_bus,
          ransus: item.ransus,
          sepeda_motor: item.sepeda_motor,
        });
      });
      let insertDataPolda = await Count_polda_day.bulkCreate(dataInputPolda, {
        fields: [
          "polda_id",
          "polres_id",
          "mobil_penumpang",
          "mobil_barang",
          "mobil_bus",
          "ransus",
          "sepeda_motor",
          "date",
        ],
        updateOnDuplicate: [
          "polda_id",
          "polres_id",
          "mobil_penumpang",
          "mobil_barang",
          "mobil_bus",
          "ransus",
          "sepeda_motor",
          "date",
        ],
        // logging: true,
        // ignoreDuplicates: true,
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
