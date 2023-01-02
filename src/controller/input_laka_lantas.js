const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const Input_laka_lantas = require("../model/input_laka_lantas");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");

const Count_polda_day = require("../model/count_lakalantas_polda_day");
const Count_polda_month = require("../model/count_lakalantas_polda_month");
const Count_polres_month = require("../model/count_lakalantas_polres_month");
const Polda = require("../model/polda");
const Polres = require("../model/polres");

// Count_polda_month.belongsTo(Polda, { foreignKey: "polda_id", as: "polda" });
// Count_polda_day.belongsTo(Polda, { foreignKey: "polda_id", as: "polda" });
Polda.hasMany(Count_polda_day, { foreignKey: "polda_id", as: "laka_lantas" });
Polda.hasMany(Count_polda_month, {
  foreignKey: "polda_id",
  as: "laka_lantas-month",
});
// Count_polres_month.belongsTo(Polda, { foreignKey: "polda_id", as: "polda" });
// Count_polres_month.belongsTo(Polres, { foreignKey: "polres_id", as: "polres" });

// Polda.hasMany(Input_laka_lantas, { foreignKey: "polda_id", as: "lakalantas" });
// Polres.hasMany(Input_laka_lantas, {
//   foreignKey: "polres_id",
//   as: "lakalantas",
// });

const decAes = (token) =>
  AESDecrypt(token, {
    isSafeUrl: true,
    parseMode: "string",
  });
module.exports = class LakaLantasController {
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
            Sequelize.fn("sum", Sequelize.col("meninggal_dunia")),
            "meninggal_dunia",
          ],
          [Sequelize.fn("sum", Sequelize.col("luka_berat")), "luka_berat"],
          [Sequelize.fn("sum", Sequelize.col("luka_ringan")), "luka_ringan"],
          [
            Sequelize.fn("sum", Sequelize.col("insiden_kecelakaan")),
            "insiden_kecelakaan",
          ],
          [Sequelize.fn("sum", Sequelize.col("total_korban")), "total_korban"],
          [
            Sequelize.fn("sum", Sequelize.col("kerugian_material")),
            "kerugian_material",
          ],
          [
            Sequelize.literal(
              "SUM(meninggal_dunia + luka_berat + luka_ringan)"
            ),
            "total",
          ],
        ],
        include: [
          {
            model: Count_polda_day,
            required: false,
            as: "laka_lantas",
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
          meninggal_dunia: parseInt(element.dataValues.meninggal_dunia) || 0,
          luka_berat: parseInt(element.dataValues.luka_berat) || 0,
          luka_ringan: parseInt(element.dataValues.luka_ringan) || 0,
          insiden_kecelakaan:
            parseInt(element.dataValues.insiden_kecelakaan) || 0,
          kerugian_material:
            parseInt(element.dataValues.kerugian_material) || 0,
          total: parseInt(element.dataValues.total) || 0,
        });
      });

      if (topPolda) {
        rows.sort((a, b) => b.insiden_kecelakaan - a.insiden_kecelakaan);
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
            Sequelize.fn("sum", Sequelize.col("meninggal_dunia")),
            "meninggal_dunia",
          ],
          [Sequelize.fn("sum", Sequelize.col("luka_berat")), "luka_berat"],
          [Sequelize.fn("sum", Sequelize.col("luka_ringan")), "luka_ringan"],
          [
            Sequelize.fn("sum", Sequelize.col("insiden_kecelakaan")),
            "insiden_kecelakaan",
          ],
          [Sequelize.fn("sum", Sequelize.col("total_korban")), "total_korban"],
          [
            Sequelize.fn("sum", Sequelize.col("kerugian_material")),
            "kerugian_material",
          ],
          [
            Sequelize.literal(
              "SUM(meninggal_dunia + luka_berat + luka_ringan)"
            ),
            "total",
          ],
        ],
        include: [
          {
            model: Count_polda_month,
            required: false,
            as: "laka_lantas-month",
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
          meninggal_dunia: parseInt(element.dataValues.meninggal_dunia) || 0,
          luka_berat: parseInt(element.dataValues.luka_berat) || 0,
          luka_ringan: parseInt(element.dataValues.luka_ringan) || 0,
          insiden_kecelakaan:
            parseInt(element.dataValues.insiden_kecelakaan) || 0,
          kerugian_material:
            parseInt(element.dataValues.kerugian_material) || 0,
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
      var list_year = [];

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

      for (
        var m = moment(start_date);
        m.isSameOrBefore(end_date);
        m.add(1, "year")
      ) {
        list_year.push(m.format("YYYY"));
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
            Sequelize.fn("sum", Sequelize.col("meninggal_dunia")),
            "meninggal_dunia",
          ],
          [Sequelize.fn("sum", Sequelize.col("luka_berat")), "luka_berat"],
          [Sequelize.fn("sum", Sequelize.col("luka_ringan")), "luka_ringan"],
          // [Sequelize.fn("date_trunc", "month", Sequelize.col("date")), "year"],
          [
            Sequelize.fn("sum", Sequelize.col("kerugian_material")),
            "kerugian_material",
          ],
          [
            Sequelize.fn("sum", Sequelize.col("insiden_kecelakaan")),
            "insiden_kecelakaan",
          ],
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
      } else if (type === "year") {
        getDataRules.group = "year";
        getDataRules.attributes.push([
          Sequelize.fn("date_trunc", "year", Sequelize.col("date")),
          "year",
        ]);
      }

      let rows = await Count_polda_day.findAll(getDataRules);


      let finals = [];
      if (type === "day") {
        const asd = list_day.map((item, index) => {
          const data = rows.find((x) => x.dataValues.date == item);
          if (data) {
            finals.push({
              meninggal_dunia: parseInt(data.meninggal_dunia),
              luka_ringan: parseInt(data.luka_ringan),
              luka_berat: parseInt(data.luka_berat),
              kerugian_material: parseInt(data.kerugian_material),
              insiden_kecelakaan: parseInt(data.insiden_kecelakaan),
              date: data.date,
            });
          } else {
            finals.push({
              meninggal_dunia: 0,
              luka_ringan: 0,
              luka_berat: 0,
              kerugian_material: 0,
              insiden_kecelakaan: 0,
              date: item,
            });
          }
        });
      } else if (type === "month") {
        let abc = rows.map((element, index) => {
          return {
            meninggal_dunia: parseInt(element.dataValues.meninggal_dunia),
            luka_ringan: parseInt(element.dataValues.luka_ringan),
            luka_berat: parseInt(element.dataValues.luka_berat),
            kerugian_material: parseInt(element.dataValues.kerugian_material),
            insiden_kecelakaan: parseInt(element.dataValues.insiden_kecelakaan),
            date: moment(element.dataValues.month).format("MMMM"),
          };
        });

        const asd = list_month.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              meninggal_dunia: parseInt(data.meninggal_dunia),
              luka_ringan: parseInt(data.luka_ringan),
              luka_berat: parseInt(data.luka_berat),
              kerugian_material: parseInt(data.kerugian_material),
              insiden_kecelakaan: parseInt(data.insiden_kecelakaan),
              date: data.date,
            });
          } else {
            finals.push({
              meninggal_dunia: 0,
              luka_ringan: 0,
              luka_berat: 0,
              kerugian_material: 0,
              insiden_kecelakaan: 0,
              date: item,
            });
          }
        });
      } else if (type === "year") {
        let abc = rows.map((element, index) => {
          return {
            meninggal_dunia: parseInt(element.dataValues.meninggal_dunia),
            luka_ringan: parseInt(element.dataValues.luka_ringan),
            luka_berat: parseInt(element.dataValues.luka_berat),
            kerugian_material: parseInt(element.dataValues.kerugian_material),
            insiden_kecelakaan: parseInt(element.dataValues.insiden_kecelakaan),
            date: moment(element.dataValues.year).format("YYYY"),
          };
        });

        const asd = list_year.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              meninggal_dunia: parseInt(data.meninggal_dunia),
              luka_ringan: parseInt(data.luka_ringan),
              luka_berat: parseInt(data.luka_berat),
              kerugian_material: parseInt(data.kerugian_material),
              insiden_kecelakaan: parseInt(data.insiden_kecelakaan),
              date: data.date,
            });
          } else {
            finals.push({
              meninggal_dunia: 0,
              luka_ringan: 0,
              luka_berat: 0,
              kerugian_material: 0,
              insiden_kecelakaan: 0,
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
  // static get = async (req, res) => {
  //   try {
  //     const { nasional, polda, polda_id, polres, polres_id, filter, month } =
  //       req.query;
  //     let finalResponse = "";
  //     if (nasional) {
  //       let lakalantas = await Count_polda_month.findAll({
  //         include: [{ model: Polda, as: "polda" }],
  //       });

  //       let dataPolda = await Polda.findAll({
  //         attributes: ["id", "name_polda"],
  //       });

  //       let arrayResponse = [];
  //       let reduce_nasional = lakalantas.reduce((prevVal, currVal) => {
  //         Object.keys(currVal.dataValues).forEach(function (key) {
  //           if (
  //             key === "polda_id" ||
  //             key === "polres_id" ||
  //             key === "date" ||
  //             key === "id" ||
  //             key === "created_at" ||
  //             key === "updated_at" ||
  //             key === "deleted_at" ||
  //             key === "polda"
  //           ) {
  //           } else {
  //             prevVal[key] = (prevVal[key] || 0) + currVal[key];
  //           }
  //         });
  //         return prevVal;
  //       }, {});

  //       let result = Object.values(
  //         lakalantas.reduce((a, { polda_id, ...props }) => {
  //           if (!a[polda_id])
  //             a[polda_id] = Object.assign({}, { polda_id, data: [props] });
  //           else a[polda_id].data.push(props);
  //           return a;
  //         }, {})
  //       );
  //       const finalResult = [];
  //       result.forEach((item) => {
  //         var meninggal_dunia = 0;
  //         var luka_berat = 0;
  //         var luka_ringan = 0;
  //         var kerugian_material = 0;
  //         var name_polda = "";
  //         var jumlah = 0;
  //         item.data.forEach((itm) => {
  //           name_polda = itm.dataValues.polda.name_polda;
  //           meninggal_dunia += itm.dataValues.meninggal_dunia;
  //           luka_berat += itm.dataValues.luka_berat;
  //           luka_ringan += itm.dataValues.luka_ringan;
  //           kerugian_material += itm.dataValues.kerugian_material;
  //           jumlah +=
  //             itm.dataValues.meninggal_dunia +
  //             itm.dataValues.luka_berat +
  //             itm.dataValues.luka_ringan +
  //             itm.dataValues.kerugian_material;
  //         });
  //         finalResult.push({
  //           polda_id: item.polda_id,
  //           name_polda: name_polda,
  //           meninggal_dunia: meninggal_dunia,
  //           luka_berat: luka_berat,
  //           luka_ringan: luka_ringan,
  //           kerugian_material: kerugian_material,
  //           jumlah: jumlah,
  //         });
  //       });
  //       dataPolda.map((element, index) => {
  //         let abc = finalResult.find((x) => {
  //           return x.polda_id == element.dataValues.id;
  //         });

  //         if (!abc) {
  //           finalResult.push({
  //             polda_id: element.dataValues.id,
  //             name_polda: element.dataValues.name_polda,
  //             meninggal_dunia: 0,
  //             luka_berat: 0,
  //             luka_ringan: 0,
  //             kerugian_material: 0,
  //             jumlah: 0,
  //           });
  //         }
  //         return element;
  //       });

  //       let jumlah = Object.values(reduce_nasional).reduce((a, b) => {
  //         return a + b;
  //       });
  //       finalResponse = {
  //         data: finalResult,
  //         jumlah: { ...reduce_nasional, jumlah },
  //         recordsFiltered: finalResult.length,
  //         recordsTotal: finalResult.length,
  //       };
  //     }

  //     if (polda) {
  //       let arrayResponse = [];
  //       let lakalantas = await Count_polres_month.findAll({
  //         include: [
  //           { model: Polda, as: "polda" },
  //           { model: Polres, as: "polres" },
  //         ],
  //         where: {
  //           polda_id: polda_id,
  //         },
  //       });

  //       if (lakalantas.length > 0) {
  //         let dataPolres = await Polres.findAll({
  //           attributes: ["id", "polda_id", "name_polres"],
  //           where: {
  //             polda_id: polda_id,
  //           },
  //         });

  //         let reduce_polda = lakalantas.reduce((prevVal, currVal) => {
  //           Object.keys(currVal.dataValues).forEach(function (key) {
  //             if (
  //               key === "polda_id" ||
  //               key === "polres_id" ||
  //               key === "date" ||
  //               key === "id" ||
  //               key === "created_at" ||
  //               key === "updated_at" ||
  //               key === "deleted_at" ||
  //               key === "polda" ||
  //               key === "polres"
  //             ) {
  //             } else {
  //               prevVal[key] = (prevVal[key] || 0) + currVal[key];
  //             }
  //           });
  //           return prevVal;
  //         }, {});

  //         let result = Object.values(
  //           lakalantas.reduce((a, { polres_id, ...props }) => {
  //             if (!a[polres_id])
  //               a[polres_id] = Object.assign({}, { polres_id, data: [props] });
  //             else a[polres_id].data.push(props);
  //             return a;
  //           }, {})
  //         );
  //         const finalResult = [];
  //         result.forEach((item) => {
  //           var meninggal_dunia = 0;
  //           var luka_berat = 0;
  //           var luka_ringan = 0;
  //           var kerugian_material = 0;
  //           var name_polres = "";
  //           var jumlah = 0;
  //           item.data.forEach((itm) => {
  //             name_polres = itm.dataValues.polres.name_polres;
  //             meninggal_dunia += itm.dataValues.meninggal_dunia;
  //             luka_berat += itm.dataValues.luka_berat;
  //             luka_ringan += itm.dataValues.luka_ringan;
  //             kerugian_material += itm.dataValues.kerugian_material;
  //             jumlah +=
  //               itm.dataValues.meninggal_dunia +
  //               itm.dataValues.luka_berat +
  //               itm.dataValues.luka_ringan +
  //               itm.dataValues.kerugian_material;
  //           });
  //           finalResult.push({
  //             polres_id: item.polres_id,
  //             meninggal_dunia: meninggal_dunia,
  //             name_polres: name_polres,
  //             luka_berat: luka_berat,
  //             luka_ringan: luka_ringan,
  //             kerugian_material: kerugian_material,
  //             jumlah: jumlah,
  //           });
  //         });
  //         dataPolres.map((element, index) => {
  //           let abc = finalResult.find((x) => {
  //             return x.polres_id == element.dataValues.id;
  //           });

  //           if (!abc) {
  //             finalResult.push({
  //               polres_id: element.dataValues.id,
  //               name_polres: element.dataValues.name_polres,
  //               meninggal_dunia: 0,
  //               luka_berat: 0,
  //               luka_ringan: 0,
  //               kerugian_material: 0,
  //               jumlah: 0,
  //             });
  //           }
  //           return element;
  //         });

  //         let jumlah = Object.values(reduce_polda).reduce((a, b) => {
  //           return a + b;
  //         });
  //         arrayResponse.push(
  //           { ...reduce_polda, jumlah },
  //           { data: finalResult }
  //         );
  //         finalResponse = arrayResponse;
  //       } else {
  //         finalResponse = [
  //           {
  //             meninggal_dunia: 0,
  //             luka_berat: 0,
  //             luka_ringan: 0,
  //             kerugian_material: 0,
  //             jumlah: 0,
  //           },
  //           { data: [] },
  //         ];
  //       }
  //     }

  //     if (polres) {
  //       let lakalantas = await Count_polres_month.findAll({
  //         include: [{ model: Polres, as: "polres" }],
  //         where: {
  //           polres_id: polres_id,
  //         },
  //       });

  //       let reduce_polres = lakalantas.reduce((prevVal, currVal) => {
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
  //       finalResponse = { ...reduce_polres, jumlah };
  //     }
  //     response(res, true, "Succeed", finalResponse);
  //   } catch (error) {
  //     response(res, false, "Failed", error.message);
  //   }
  // };

  // static countByMonth = async (req, res) => {
  //   try {
  //     const { nasional, polda, polres, polda_id, polres_id } = req.query;
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
  //     let finalResponse = "";
  //     if (nasional) {
  //       let lakalantas = await Count_polda_month.findAll();

  //       let result = Object.values(
  //         lakalantas.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );
  //       const finalResult = [];
  //       result.forEach((item) => {
  //         var meninggal_dunia = 0;
  //         var date = "";
  //         var luka_berat = 0;
  //         var luka_ringan = 0;
  //         var kerugian_material = 0;
  //         var jumlah = 0;
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           meninggal_dunia += itm.dataValues.meninggal_dunia;
  //           luka_berat += itm.dataValues.luka_berat;
  //           luka_ringan += itm.dataValues.luka_ringan;
  //           kerugian_material += itm.dataValues.kerugian_material;
  //           jumlah +=
  //             itm.dataValues.meninggal_dunia +
  //             itm.dataValues.luka_berat +
  //             itm.dataValues.luka_ringan +
  //             itm.dataValues.kerugian_material;
  //         });
  //         finalResult.push({
  //           date: moment(date).format("MMMM"),
  //           meninggal_dunia: meninggal_dunia,
  //           luka_berat: luka_berat,
  //           luka_ringan: luka_ringan,
  //           kerugian_material: kerugian_material,
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
  //             meninggal_dunia: 0,
  //             luka_berat: 0,
  //             luka_ringan: 0,
  //             kerugian_material: 0,
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
  //       let lakalantas = await Count_polres_month.findAll({
  //         where: {
  //           polda_id: polda_id,
  //         },
  //       });

  //       let reduce_polda = lakalantas.reduce((prevVal, currVal) => {
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
  //         lakalantas.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );
  //       const finalResult = [];
  //       result.forEach((item) => {
  //         var meninggal_dunia = 0;
  //         var luka_berat = 0;
  //         var luka_ringan = 0;
  //         var kerugian_material = 0;
  //         var date = "";
  //         var jumlah = 0;
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           meninggal_dunia += itm.dataValues.meninggal_dunia;
  //           luka_berat += itm.dataValues.luka_berat;
  //           luka_ringan += itm.dataValues.luka_ringan;
  //           kerugian_material += itm.dataValues.kerugian_material;
  //           jumlah +=
  //             itm.dataValues.meninggal_dunia +
  //             itm.dataValues.luka_berat +
  //             itm.dataValues.luka_ringan +
  //             itm.dataValues.kerugian_material;
  //         });
  //         finalResult.push({
  //           date: moment(date).format("MMMM"),
  //           meninggal_dunia: meninggal_dunia,
  //           luka_berat: luka_berat,
  //           luka_ringan: luka_ringan,
  //           kerugian_material: kerugian_material,
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
  //             meninggal_dunia: 0,
  //             luka_berat: 0,
  //             luka_ringan: 0,
  //             kerugian_material: 0,
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
  //       let lakalantas = await Count_polres_month.findAll({
  //         where: {
  //           polres_id: polres_id,
  //         },
  //       });

  //       let reduce_polres = lakalantas.reduce((prevVal, currVal) => {
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
  //         lakalantas.reduce((a, { date, ...props }) => {
  //           if (!a[date]) a[date] = Object.assign({}, { date, data: [props] });
  //           else a[date].data.push(props);
  //           return a;
  //         }, {})
  //       );
  //       const finalResult = [];
  //       result.forEach((item) => {
  //         var meninggal_dunia = 0;
  //         var date = "";
  //         var luka_berat = 0;
  //         var luka_ringan = 0;
  //         var kerugian_material = 0;
  //         var jumlah = 0;
  //         item.data.forEach((itm) => {
  //           date = itm.dataValues.date;
  //           meninggal_dunia += itm.dataValues.meninggal_dunia;
  //           luka_berat += itm.dataValues.luka_berat;
  //           luka_ringan += itm.dataValues.luka_ringan;
  //           kerugian_material += itm.dataValues.kerugian_material;
  //           jumlah +=
  //             itm.dataValues.meninggal_dunia +
  //             itm.dataValues.luka_berat +
  //             itm.dataValues.luka_ringan +
  //             itm.dataValues.kerugian_material;
  //         });
  //         finalResult.push({
  //           date: moment(date).format("MMMM"),
  //           meninggal_dunia: meninggal_dunia,
  //           luka_berat: luka_berat,
  //           luka_ringan: luka_ringan,
  //           kerugian_material: kerugian_material,
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
  //             meninggal_dunia: 0,
  //             luka_berat: 0,
  //             luka_ringan: 0,
  //             kerugian_material: 0,
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
      const modelAttr = Object.keys(Input_laka_lantas.getAttributes());
      let getDataRules = {
        group: ["polda.id"],
        include: [
          {
            model: Input_laka_lantas,
            required: false,
            as: "lakalantas",
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
          } else if (filter === "jumlah_kecelakaan") {
            whereBuilder.push([
              Sequelize.literal(
                "SUM(luka_berat + luka_ringan + meninggal_dunia)"
              ),
              "value",
            ]);
          }
        });
      } else {
        modelAttr.forEach((key) => {
          if (
            key == "luka_berat" ||
            key == "meninggal_dunia" ||
            key == "luka_ringan"
          ) {
            whereBuilder.push(
              [Sequelize.fn("sum", Sequelize.col(`${key}`)), key],
              [
                Sequelize.literal(
                  "SUM(luka_berat + luka_ringan + meninggal_dunia)"
                ),
                "jumlah_kecelakaan",
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
      const modelAttr = Object.keys(Input_laka_lantas.getAttributes());
      let getDataRules = {
        group: ["polda.id"],
        include: [
          {
            model: Input_laka_lantas,
            required: false,
            as: "lakalantas",
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
          } else if (filter === "jumlah_kecelakaan") {
            whereBuilder.push([
              Sequelize.literal(
                "SUM(luka_berat + luka_ringan + meninggal_dunia)"
              ),
              "value",
            ]);
          }
        });
      } else {
        modelAttr.forEach((key) => {
          if (
            key == "luka_berat" ||
            key == "meninggal_dunia" ||
            key == "luka_ringan"
          ) {
            whereBuilder.push(
              [Sequelize.fn("sum", Sequelize.col(`${key}`)), key],
              [
                Sequelize.literal(
                  "SUM(luka_berat + luka_ringan + meninggal_dunia)"
                ),
                "jumlah_kecelakaan",
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
  //           meninggal_dunia: item.meninggal_dunia,
  //           luka_ringan: item.luka_ringan,
  //           luka_berat: item.luka_berat,
  //           kerugian_material: item.kerugian_material,
  //         });
  //       });
  //       let insertDataPolda = await Input_laka_lantas.bulkCreate(
  //         dataInputPolda,
  //         { transaction: transaction }
  //       );
  //     } else {
  //       let checkData = await Input_laka_lantas.findOne({
  //         where: {
  //           polda_id: decAes(req.body.polda_id),
  //           polres_id: decAes(req.body.polres_id),
  //           date: req.body.date,
  //         },
  //       });

  //       let InputData = {
  //         polda_id: decAes(req.body.polda_id),
  //         polres_id: decAes(req.body.polres_id),
  //         date: req.body.date,
  //         meninggal_dunia: req.body.meninggal_dunia,
  //         luka_ringan: req.body.luka_ringan,
  //         luka_berat: req.body.luka_berat,
  //         kerugian_material: req.body.kerugian_material,
  //       };
  //       if (checkData) {
  //         let updateData = await Input_laka_lantas.update(InputData, {
  //           where: {
  //             polda_id: decAes(req.body.polda_id),
  //             polres_id: decAes(req.body.polres_id),
  //             date: req.body.date,
  //           },
  //           transaction: transaction,
  //         });
  //       } else {
  //         let insertData = await Input_laka_lantas.create(InputData, {
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
          meninggal_dunia: item.meninggal_dunia,
          luka_ringan: item.luka_ringan,
          luka_berat: item.luka_berat,
          kerugian_material: item.kerugian_material,
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
