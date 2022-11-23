const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const Input_turjagwali = require("../model/input_turjagwali");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");

const Count_polda_day = require("../model/count_turjagwali_polda_day");
const Count_polda_month = require("../model/count_turjagwali_polda_month");
const Count_polres_month = require("../model/count_turjagwali_polres_month");
const Polda = require("../model/polda");
const Polres = require("../model/polres");

// Count_polda_month.belongsTo(Polda, { foreignKey: "polda_id", as: "polda" });
// Count_polda_day.belongsTo(Polda, { foreignKey: "polda_id", as: "polda" });

// Count_polres_month.belongsTo(Polda, { foreignKey: "polda_id", as: "polda" });
// Count_polres_month.belongsTo(Polres, { foreignKey: "polres_id", as: "polres" });

Polda.hasMany(Count_polda_day, { foreignKey: "polda_id", as: "turjagwali" });
Polda.hasMany(Count_polda_month, {
  foreignKey: "polda_id",
  as: "turjagwali-month",
});

// Polda.hasMany(Input_turjagwali, { foreignKey: "polda_id", as: "turjagwali" });
Polres.hasMany(Input_turjagwali, {
  foreignKey: "polres_id",
  as: "turjagwali",
});

const decAes = (token) =>
  AESDecrypt(token, {
    isSafeUrl: true,
    parseMode: "string",
  });

module.exports = class TurjagwaliController {
  static get = async (req, res) => {
    try {
      const { nasional, polda, polda_id, polres, polres_id, filter, month } =
        req.query;
      let finalResponse = "";
      if (nasional) {
        let turjagwali = await Count_polda_month.findAll({
          include: [{ model: Polda, as: "polda" }],
        });

        let dataPolda = await Polda.findAll({
          attributes: ["id", "name_polda"],
        });

        let arrayResponse = [];
        let reduce_nasional = turjagwali.reduce((prevVal, currVal) => {
          Object.keys(currVal.dataValues).forEach(function (key) {
            if (
              key === "polda_id" ||
              key === "polres_id" ||
              key === "date" ||
              key === "id" ||
              key === "created_at" ||
              key === "updated_at" ||
              key === "deleted_at" ||
              key === "polda"
            ) {
            } else {
              prevVal[key] = (prevVal[key] || 0) + currVal[key];
            }
          });
          return prevVal;
        }, {});

        let result = Object.values(
          turjagwali.reduce((a, { polda_id, ...props }) => {
            if (!a[polda_id])
              a[polda_id] = Object.assign({}, { polda_id, data: [props] });
            else a[polda_id].data.push(props);
            return a;
          }, {})
        );
        const finalResult = [];
        result.forEach((item) => {
          var pengaturan = 0;
          var penjagaan = 0;
          var patroli = 0;
          var pengawalan = 0;
          var name_polda = "";
          var jumlah = 0;
          item.data.forEach((itm) => {
            name_polda = itm.dataValues.polda.name_polda;
            pengaturan += itm.dataValues.pengaturan;
            penjagaan += itm.dataValues.penjagaan;
            patroli += itm.dataValues.patroli;
            pengawalan += itm.dataValues.pengawalan;
            jumlah +=
              itm.dataValues.pengaturan +
              itm.dataValues.penjagaan +
              itm.dataValues.patroli +
              itm.dataValues.pengawalan;
          });
          finalResult.push({
            polda_id: item.polda_id,
            name_polda: name_polda,
            pengaturan: pengaturan,
            penjagaan: penjagaan,
            patroli: patroli,
            pengawalan: pengawalan,
            jumlah: jumlah,
          });
        });
        let abc = [];

        let jumlah = Object.values(reduce_nasional).reduce((a, b) => {
          return a + b;
        });
        dataPolda.map((element, index) => {
          let abc = finalResult.find((x) => {
            return x.polda_id == element.dataValues.id;
          });

          if (!abc) {
            finalResult.push({
              polda_id: element.dataValues.id,
              name_polda: element.dataValues.name_polda,
              pengaturan: 0,
              penjagaan: 0,
              patroli: 0,
              pengawalan: 0,
              jumlah: 0,
            });
          }
          return element;
        });
        finalResponse = {
          data: finalResult,
          jumlah: { ...reduce_nasional, jumlah },
          recordsFiltered: finalResult.length,
          recordsTotal: finalResult.length,
        };
      }

      if (polda) {
        let arrayResponse = [];
        let turjagwali = await Count_polres_month.findAll({
          include: [
            { model: Polda, as: "polda" },
            { model: Polres, as: "polres" },
          ],
          where: {
            polda_id: polda_id,
          },
        });

        if (turjagwali.length > 0) {
          let dataPolres = await Polres.findAll({
            attributes: ["id", "polda_id", "name_polres"],
            where: {
              polda_id: polda_id,
            },
          });

          let reduce_polda = turjagwali.reduce((prevVal, currVal) => {
            Object.keys(currVal.dataValues).forEach(function (key) {
              if (
                key === "polda_id" ||
                key === "polres_id" ||
                key === "date" ||
                key === "id" ||
                key === "created_at" ||
                key === "updated_at" ||
                key === "deleted_at" ||
                key === "polda" ||
                key === "polres"
              ) {
              } else {
                prevVal[key] = (prevVal[key] || 0) + currVal[key];
              }
            });
            return prevVal;
          }, {});

          let result = Object.values(
            turjagwali.reduce((a, { polres_id, ...props }) => {
              if (!a[polres_id])
                a[polres_id] = Object.assign({}, { polres_id, data: [props] });
              else a[polres_id].data.push(props);
              return a;
            }, {})
          );
          const finalResult = [];
          result.forEach((item) => {
            var pengaturan = 0;
            var penjagaan = 0;
            var patroli = 0;
            var pengawalan = 0;
            var name_polres = "";
            var jumlah = 0;
            item.data.forEach((itm) => {
              name_polres = itm.dataValues.polres.name_polres;
              pengaturan += itm.dataValues.pengaturan;
              penjagaan += itm.dataValues.penjagaan;
              patroli += itm.dataValues.patroli;
              pengawalan += itm.dataValues.pengawalan;
              jumlah +=
                itm.dataValues.pengaturan +
                itm.dataValues.penjagaan +
                itm.dataValues.patroli +
                itm.dataValues.pengawalan;
            });
            finalResult.push({
              polres_id: item.polres_id,
              pengaturan: pengaturan,
              name_polres: name_polres,
              penjagaan: penjagaan,
              patroli: patroli,
              pengawalan: pengawalan,
              jumlah: jumlah,
            });
          });
          dataPolres.map((element, index) => {
            let abc = finalResult.find((x) => {
              return x.polres_id == element.dataValues.id;
            });

            if (!abc) {
              finalResult.push({
                polres_id: element.dataValues.id,
                name_polres: element.dataValues.name_polres,
                pengaturan: 0,
                pengawalan: 0,
                penjagaan: 0,
                patroli: 0,
                jumlah: 0,
              });
            }
            return element;
          });

          let jumlah = Object.values(reduce_polda).reduce((a, b) => {
            return a + b;
          });
          arrayResponse.push(
            { ...reduce_polda, jumlah },
            { data: finalResult }
          );
          finalResponse = arrayResponse;
        } else {
          finalResponse = [
            {
              pengaturan: 0,
              pengawalan: 0,
              penjagaan: 0,
              patroli: 0,
              jumlah: 0,
            },
            { data: [] },
          ];
        }
      }

      if (polres) {
        let turjagwali = await Count_polres_month.findAll({
          include: [{ model: Polres, as: "polres" }],
          where: {
            polres_id: polres_id,
          },
        });

        let reduce_polres = turjagwali.reduce((prevVal, currVal) => {
          Object.keys(currVal.dataValues).forEach(function (key) {
            if (
              key === "polda_id" ||
              key === "polres_id" ||
              key === "date" ||
              key === "id" ||
              key === "created_at" ||
              key === "updated_at" ||
              key === "deleted_at" ||
              key === "polres"
            ) {
            } else {
              prevVal[key] = (prevVal[key] || 0) + currVal[key];
            }
          });
          return prevVal;
        }, {});

        let jumlah = Object.values(reduce_polres).reduce((a, b) => {
          return a + b;
        }, 0);
        finalResponse = { ...reduce_polres, jumlah };
      }
      response(res, true, "Succeed", finalResponse);
    } catch (error) {
      response(res, false, "Failed", error.message);
    }
  };

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
          [Sequelize.fn("sum", Sequelize.col("pengaturan")), "pengaturan"],
          [Sequelize.fn("sum", Sequelize.col("penjagaan")), "penjagaan"],
          [Sequelize.fn("sum", Sequelize.col("pengawalan")), "pengawalan"],
          [Sequelize.fn("sum", Sequelize.col("patroli")), "patroli"],
          [
            Sequelize.literal(
              "SUM(pengaturan + penjagaan + pengawalan + patroli)"
            ),
            "total",
          ],
        ],
        include: [
          {
            model: Count_polda_day,
            required: false,
            as: "turjagwali",
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
          pengaturan: parseInt(element.dataValues.pengaturan) || 0,
          penjagaan: parseInt(element.dataValues.penjagaan) || 0,
          pengawalan: parseInt(element.dataValues.pengawalan) || 0,
          patroli: parseInt(element.dataValues.patroli) || 0,
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
          [Sequelize.fn("sum", Sequelize.col("pengaturan")), "pengaturan"],
          [Sequelize.fn("sum", Sequelize.col("penjagaan")), "penjagaan"],
          [Sequelize.fn("sum", Sequelize.col("pengawalan")), "pengawalan"],
          [Sequelize.fn("sum", Sequelize.col("patroli")), "patroli"],
          [
            Sequelize.literal(
              "SUM(pengaturan + penjagaan + pengawalan + patroli)"
            ),
            "total",
          ],
        ],
        include: [
          {
            model: Count_polda_month,
            required: false,
            as: "turjagwali-month",
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
          pengaturan: parseInt(element.dataValues.pengaturan) || 0,
          pengawalan: parseInt(element.dataValues.pengawalan) || 0,
          patroli: parseInt(element.dataValues.patroli) || 0,
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
            Sequelize.fn("sum", Sequelize.col("pengaturan")),
            "pengaturan",
          ],
          [
            Sequelize.fn("sum", Sequelize.col("penjagaan")),
            "penjagaan",
          ],
          [
            Sequelize.fn("sum", Sequelize.col("pengawalan")),
            "pengawalan",
          ],
          // [Sequelize.fn("date_trunc", "month", Sequelize.col("date")), "year"],
          [Sequelize.fn("sum", Sequelize.col("patroli")), "patroli"],
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
              pengaturan: parseInt(data.pengaturan),
              pengawalan: parseInt(data.pengawalan),
              penjagaan: parseInt(data.penjagaan),
              patroli: parseInt(data.patroli),
              date: data.date,
            });
          } else {
            finals.push({
              pengaturan: 0,
              pengawalan: 0,
              penjagaan: 0,
              patroli: 0,
              date: item,
            });
          }
        });
      } else if (type === "month") {
        let abc = rows.map((element, index) => {
          return {
            pengaturan: parseInt(element.dataValues.pengaturan),
            pengawalan: parseInt(element.dataValues.pengawalan),
            penjagaan: parseInt(element.dataValues.penjagaan),
            patroli: parseInt(element.dataValues.patroli),
            date: moment(element.dataValues.month).format("MMMM"),
          };
        });

        const asd = list_month.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              pengaturan: parseInt(data.pengaturan),
              pengawalan: parseInt(data.pengawalan),
              penjagaan: parseInt(data.penjagaan),
              patroli: parseInt(data.patroli),
              date: data.date,
            });
          } else {
            finals.push({
              pengaturan: 0,
              pengawalan: 0,
              penjagaan: 0,
              patroli: 0,
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

  // static countByMonth = async (req, res) => {
  //   try {
  //     const { nasional, polda, polres, polda_id, polres_id } = req.query;
  //     let finalResponse = "";
  //     const dataMonth = [
  //       "January",
  //       "February",
  //       "March",
  //       "April",
  //       "Mei",
  //       "June",
  //       "July",
  //       "August",
  //       "September",
  //       "October",
  //       "November",
  //       "December",
  //     ];
  //     if (nasional) {
  //       let turjagwali = await Count_polda_month.findAll();

  //       let result = Object.values(
  //         turjagwali.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );
  //       const finalResult = [];
  //       result.forEach((item) => {
  //         var pengaturan = 0;
  //         var date = "";
  //         var pengawalan = 0;
  //         var penjagaan = 0;
  //         var patroli = 0;
  //         var jumlah = 0;
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           pengaturan += itm.dataValues.pengaturan;
  //           pengawalan += itm.dataValues.pengawalan;
  //           penjagaan += itm.dataValues.penjagaan;
  //           patroli += itm.dataValues.patroli;
  //           jumlah +=
  //             itm.dataValues.pengaturan +
  //             itm.dataValues.pengawalan +
  //             itm.dataValues.penjagaan +
  //             itm.dataValues.patroli;
  //         });
  //         finalResult.push({
  //           date: moment(date).format("MMMM"),
  //           pengaturan: pengaturan,
  //           pengawalan: pengawalan,
  //           penjagaan: penjagaan,
  //           patroli: patroli,
  //           jumlah: jumlah,
  //         });
  //       });
  //       dataMonth.map((element, index) => {
  //         let abc = finalResult.find((x) => {
  //           return x.date == element;
  //         });

  //         if (!abc) {
  //           finalResult.push({
  //             date: element,
  //             pengaturan: 0,
  //             pengawalan: 0,
  //             penjagaan: 0,
  //             patroli: 0,
  //             jumlah: 0,
  //           });
  //         }
  //         return element;
  //       });
  //       finalResponse = {
  //         data: finalResult,
  //         recordsFiltered: finalResult.length,
  //         recordsTotal: finalResult.length,
  //       };
  //     }
  //     if (polda) {
  //       let arrayResponse = [];
  //       let turjagwali = await Count_polres_month.findAll({
  //         where: {
  //           polda_id: polda_id,
  //         },
  //       });

  //       let reduce_polda = turjagwali.reduce((prevVal, currVal) => {
  //         Object.keys(currVal.dataValues).forEach(function (key) {
  //           if (
  //             key === "polda_id" ||
  //             key === "polres_id" ||
  //             key === "date" ||
  //             key === "id" ||
  //             key === "created_at" ||
  //             key === "updated_at" ||
  //             key === "deleted_at" ||
  //             key === "polda" ||
  //             key === "polres"
  //           ) {
  //           } else {
  //             prevVal[key] = (prevVal[key] || 0) + currVal[key];
  //           }
  //         });
  //         return prevVal;
  //       }, {});

  //       let result = Object.values(
  //         turjagwali.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );
  //       const finalResult = [];
  //       result.forEach((item) => {
  //         var pengaturan = 0;
  //         var pengawalan = 0;
  //         var penjagaan = 0;
  //         var patroli = 0;
  //         var date = "";
  //         var jumlah = 0;
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           pengaturan += itm.dataValues.pengaturan;
  //           pengawalan += itm.dataValues.pengawalan;
  //           penjagaan += itm.dataValues.penjagaan;
  //           patroli += itm.dataValues.patroli;
  //           jumlah +=
  //             itm.dataValues.pengaturan +
  //             itm.dataValues.pengawalan +
  //             itm.dataValues.penjagaan +
  //             itm.dataValues.patroli;
  //         });
  //         finalResult.push({
  //           date: moment(date).format("MMMM"),
  //           pengaturan: pengaturan,
  //           pengawalan: pengawalan,
  //           penjagaan: penjagaan,
  //           patroli: patroli,
  //           jumlah: jumlah,
  //         });
  //       });
  //       dataMonth.map((element, index) => {
  //         let abc = finalResult.find((x) => {
  //           return x.date == element;
  //         });

  //         if (!abc) {
  //           finalResult.push({
  //             date: element,
  //             pengaturan: 0,
  //             penjagaan: 0,
  //             pengawalan: 0,
  //             patroli: 0,
  //             jumlah: 0,
  //           });
  //         }
  //         return element;
  //       });

  //       let jumlah = Object.values(reduce_polda).reduce((a, b) => {
  //         return a + b;
  //       });
  //       arrayResponse.push({ ...reduce_polda, jumlah }, { data: finalResult });
  //       finalResponse = arrayResponse;
  //     }

  //     if (polres) {
  //       let turjagwali = await Count_polres_month.findAll({
  //         where: {
  //           polres_id: polres_id,
  //         },
  //       });

  //       let reduce_polres = turjagwali.reduce((prevVal, currVal) => {
  //         Object.keys(currVal.dataValues).forEach(function (key) {
  //           if (
  //             key === "polda_id" ||
  //             key === "polres_id" ||
  //             key === "date" ||
  //             key === "id" ||
  //             key === "created_at" ||
  //             key === "updated_at" ||
  //             key === "deleted_at" ||
  //             key === "polres"
  //           ) {
  //           } else {
  //             prevVal[key] = (prevVal[key] || 0) + currVal[key];
  //           }
  //         });
  //         return prevVal;
  //       }, {});

  //       let jumlah = Object.values(reduce_polres).reduce((a, b) => {
  //         return a + b;
  //       }, 0);

  //       let result = Object.values(
  //         turjagwali.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );
  //       const finalResult = [];
  //       result.forEach((item) => {
  //         var pengaturan = 0;
  //         var date = "";
  //         var pengawalan = 0;
  //         var penjagaan = 0;
  //         var patroli = 0;
  //         var jumlah = 0;
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           pengaturan += itm.dataValues.pengaturan;
  //           pengawalan += itm.dataValues.pengawalan;
  //           penjagaan += itm.dataValues.penjagaan;
  //           patroli += itm.dataValues.patroli;
  //           jumlah +=
  //             itm.dataValues.pengaturan +
  //             itm.dataValues.pengawalan +
  //             itm.dataValues.penjagaan +
  //             itm.dataValues.patroli;
  //         });
  //         finalResult.push({
  //           date: moment(date).format("MMMM"),
  //           pengaturan: pengaturan,
  //           pengawalan: pengawalan,
  //           penjagaan: penjagaan,
  //           patroli: patroli,
  //           jumlah: jumlah,
  //         });
  //       });

  //       dataMonth.map((element, index) => {
  //         let abc = finalResult.find((x) => {
  //           return x.date == element;
  //         });

  //         if (!abc) {
  //           finalResult.push({
  //             date: element,
  //             pengawalan: 0,
  //             penjagaan: 0,
  //             pengaturan: 0,
  //             patroli: 0,
  //             jumlah: 0,
  //           });
  //         }
  //         return element;
  //       });
  //       finalResponse = finalResult;
  //     }
  //     response(res, true, "Succeed", finalResponse);
  //   } catch (error) {
  //     response(res, false, "Failed", error.message);
  //   }
  // };

  static grafik_mobile = async (req, res) => {
    try {
      let { limit, page, filter } = req.query;
      const modelAttr = Object.keys(Input_turjagwali.getAttributes());
      let getDataRules = {
        group: ["polda.id"],
        include: [
          {
            model: Input_turjagwali,
            required: false,
            as: "turjagwali",
            attributes: [],
          },
        ],
        raw: true,
        nest: true,
        subQuery: false,
      };
      let whereBuilder = ["id", ["name_polda", "label"]];
      if (filter != null) {
        modelAttr.forEach((key) => {
          if (filter === key) {
            whereBuilder.push([
              Sequelize.fn("sum", Sequelize.col(`${key}`)),
              "value",
            ]);
          } else if (filter === "jumlah_turjagwali") {
            whereBuilder.push([
              Sequelize.literal(
                "SUM(pengaturan + penjagaan + patroli + pengawalan)"
              ),
              "value",
            ]);
          }
        });
      } else {
        modelAttr.forEach((key) => {
          if (
            key == "pengaturan" ||
            key == "penjagaan" ||
            key == "patroli" ||
            key == "pengawalan"
          ) {
            whereBuilder.push(
              [Sequelize.fn("sum", Sequelize.col(`${key}`)), key],
              [
                Sequelize.literal(
                  "SUM(pengaturan + penjagaan + pengawalan + patroli)"
                ),
                "jumlah_turjagwali",
              ]
            );
          }
        });
      }

      console.log(whereBuilder);

      getDataRules.attributes = whereBuilder;

      let finals = await Polda.findAll(getDataRules);
      let rows = finals.map((element, index) => {
        if (element.value == null) {
          element.value = 0;
        } else {
          element.value = parseInt(element.value);
        }
        return element;
      });
      response(res, true, "Succeed", rows);
    } catch (error) {
      response(res, false, "Failed", error.message);
    }
  };

  static top_polda = async (req, res) => {
    try {
      let { limit, page, filter } = req.query;
      const modelAttr = Object.keys(Input_turjagwali.getAttributes());
      let getDataRules = {
        group: ["polda.id"],
        include: [
          {
            model: Input_turjagwali,
            required: false,
            as: "turjagwali",
            attributes: [],
          },
        ],
        raw: true,
        nest: true,
        subQuery: false,
      };
      let whereBuilder = ["id", ["name_polda", "label"]];
      if (filter != null) {
        modelAttr.forEach((key) => {
          if (filter === key) {
            whereBuilder.push([
              Sequelize.fn("sum", Sequelize.col(`${key}`)),
              "value",
            ]);
          } else if (filter === "jumlah_turjagwali") {
            whereBuilder.push([
              Sequelize.literal(
                "SUM(pengawalan + pengaturan + penjagaan + patroli)"
              ),
              "value",
            ]);
          }
        });
      } else {
        modelAttr.forEach((key) => {
          if (
            key == "pengaturan" ||
            key == "penjagaan" ||
            key == "pengawalan" ||
            key == "patroli"
          ) {
            whereBuilder.push(
              [Sequelize.fn("sum", Sequelize.col(`${key}`)), key],
              [
                Sequelize.literal(
                  "SUM(pengaturan + penjagaan + pengawalan + patroli)"
                ),
                "jumlah_turjagwali",
              ]
            );
          }
        });
      }

      console.log(whereBuilder);

      getDataRules.attributes = whereBuilder;

      let finals = await Polda.findAll(getDataRules);
      let rows = finals.map((element, index) => {
        if (element.value == null) {
          element.value = 0;
        } else {
          element.value = parseInt(element.value);
        }
        return element;
      });
      rows.sort((a, b) => b.value - a.value);
      let row = rows.slice(0, 10);
      response(res, true, "Succeed", row);
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
  //           pengaturan: item.pengaturan,
  //           penjagaan: item.penjagaan,
  //           patroli: item.patroli,
  //           pengawalan: item.pengawalan,
  //         });
  //       });
  //       let insertDataPolda = await Input_turjagwali.bulkCreate(
  //         dataInputPolda,
  //         { transaction: transaction }
  //       );
  //     } else {
  //       let checkData = await Input_turjagwali.findOne({
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
  //         penjagaan: req.body.penjagaan,
  //         pengawalan: req.body.pengawalan,
  //         pengaturan: req.body.pengaturan,
  //         patroli: req.body.patroli,
  //       };
  //       if (checkData) {
  //         let updateData = await Input_turjagwali.update(inputData, {
  //           where: {
  //             polda_id: decAes(req.body.polda_id),
  //             polres_id: decAes(req.body.polres_id),
  //             date: req.body.date,
  //           },
  //         });
  //       } else {
  //         let insertData = await Input_turjagwali.create(inputData, {
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
          pengaturan: item.pengaturan,
          penjagaan: item.penjagaan,
          patroli: item.patroli,
          pengawalan: item.pengawalan,
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
