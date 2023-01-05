const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const Input_sdm_polantas = require("../model/bagrenmin_sdm_polantas");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");

const Count_polda_day = require("../model/bagrenmin_sdm_polantas");

const Polda = require("../model/polda");
const Polres = require("../model/polres");

// Count_polda_month.belongsTo(Polda, { foreignKey: "polda_id", as: "polda" });
// Count_polda_day.belongsTo(Polda, { foreignKey: "polda_id", as: "polda" });

// Count_polres_month.belongsTo(Polda, { foreignKey: "polda_id", as: "polda" });
// Count_polres_month.belongsTo(Polres, { foreignKey: "polres_id", as: "polres" });

Polda.hasMany(Count_polda_day, { foreignKey: "polda_id", as: "sdm_polantas" });

const decAes = (token) =>
  AESDecrypt(token, {
    isSafeUrl: true,
    parseMode: "string",
  });
module.exports = class sdm_polantasController {
  static get = async (req, res) => {
    try {
      const { nasional, polda, polda_id, polres, polres_id, filter, month } =
        req.query;
      let finalResponse = "";
      if (nasional) {
        let sdm_polantas = await Count_polda_month.findAll({
          include: [{ model: Polda, as: "polda" }],
        });

        let dataPolda = await Polda.findAll({
          attributes: ["id", "name_polda"],
        });

        let arrayResponse = [];
        let reduce_nasional = sdm_polantas.reduce((prevVal, currVal) => {
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
          sdm_polantas.reduce((a, { polda_id, ...props }) => {
            if (!a[polda_id])
              a[polda_id] = Object.assign({}, { polda_id, data: [props] });
            else a[polda_id].data.push(props);
            return a;
          }, {})
        );
        const finalResult = [];
        result.forEach((item) => {
          var baru = 0;
          var perpanjangan = 0;
          var name_polda = "";
          var jumlah = 0;
          item.data.forEach((itm) => {
            name_polda = itm.dataValues.polda.name_polda;
            baru += itm.dataValues.baru;
            perpanjangan += itm.dataValues.perpanjangan;
            jumlah += itm.dataValues.baru + itm.dataValues.perpanjangan;
          });
          finalResult.push({
            polda_id: item.polda_id,
            name_polda: name_polda,
            baru: baru,
            perpanjangan: perpanjangan,
            jumlah: jumlah,
          });
        });
        dataPolda.map((element, index) => {
          let abc = finalResult.find((x) => {
            return x.polda_id == element.dataValues.id;
          });

          if (!abc) {
            finalResult.push({
              polda_id: element.dataValues.id,
              name_polda: element.dataValues.name_polda,
              baru: 0,
              perpanjangan: 0,
              jumlah: 0,
            });
          }
          return element;
        });

        let jumlah = Object.values(reduce_nasional).reduce((a, b) => {
          return a + b;
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
        let sdm_polantas = await Count_polres_month.findAll({
          include: [
            { model: Polda, as: "polda" },
            { model: Polres, as: "polres" },
          ],
          where: {
            polda_id: polda_id,
          },
        });

        if (sdm_polantas.length > 0) {
          let dataPolres = await Polres.findAll({
            attributes: ["id", "polda_id", "name_polres"],
            where: {
              polda_id: polda_id,
            },
          });

          let reduce_polda = sdm_polantas.reduce((prevVal, currVal) => {
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
            sdm_polantas.reduce((a, { polres_id, ...props }) => {
              if (!a[polres_id])
                a[polres_id] = Object.assign({}, { polres_id, data: [props] });
              else a[polres_id].data.push(props);
              return a;
            }, {})
          );
          const finalResult = [];
          result.forEach((item) => {
            var baru = 0;
            var perpanjangan = 0;
            var name_polres = "";
            var jumlah = 0;
            item.data.forEach((itm) => {
              name_polres = itm.dataValues.polres.name_polres;
              baru += itm.dataValues.baru;
              perpanjangan += itm.dataValues.perpanjangan;
              jumlah += itm.dataValues.baru + itm.dataValues.perpanjangan;
            });
            finalResult.push({
              polres_id: item.polres_id,
              baru: baru,
              name_polres: name_polres,
              perpanjangan: perpanjangan,
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
                baru: 0,
                perpanjangan: 0,
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
            { baru: 0, perpanjangan: 0, jumlah: 0 },
            { data: [] },
          ];
        }
      }

      if (polres) {
        let sdm_polantas = await Count_polres_month.findAll({
          include: [{ model: Polres, as: "polres" }],
          where: {
            polres_id: polres_id,
          },
        });

        let reduce_polres = sdm_polantas.reduce((prevVal, currVal) => {
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
          [Sequelize.fn("sum", Sequelize.col("irjen")), "irjen"],
          [Sequelize.fn("sum", Sequelize.col("brigjen")), "brigjen"],
          [Sequelize.fn("sum", Sequelize.col("kbp")), "kbp"],
          [Sequelize.fn("sum", Sequelize.col("akbp")), "akbp"],
          [Sequelize.fn("sum", Sequelize.col("bripda")), "bripda"],
          [Sequelize.fn("sum", Sequelize.col("kp")), "kp"],
          [Sequelize.fn("sum", Sequelize.col("pns")), "pns"],
          [Sequelize.fn("sum", Sequelize.col("akp")), "akp"],
          [Sequelize.fn("sum", Sequelize.col("iptu")), "iptu"],
          [Sequelize.fn("sum", Sequelize.col("ipda")), "ipda"],
          [Sequelize.fn("sum", Sequelize.col("aiptu")), "aiptu"],
          [Sequelize.fn("sum", Sequelize.col("aipda")), "aipda"],
          [Sequelize.fn("sum", Sequelize.col("bripka")), "bripka"],
          [Sequelize.fn("sum", Sequelize.col("brigdr")), "brigdr"],
          [Sequelize.fn("sum", Sequelize.col("briptu")), "briptu"],
          [
            Sequelize.literal(
              "SUM(irjen + brigjen + kbp + akbp + kp + akp + iptu + ipda + aiptu + aipda + bripka + brigdr + briptu + bripda + pns)"
            ),
            "total",
          ],
          // [
          //   Sequelize.literal("SUM(baru + perpanjangan + peningkatan)"),
          //   "total",
          // ],
        ],
        include: [
          {
            model: Count_polda_day,
            required: false,
            as: "sdm_polantas",
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
          irjen: parseInt(element.dataValues.irjen) || 0,
          brigjen: parseInt(element.dataValues.brigjen) || 0,
          kbp: parseInt(element.dataValues.kbp) || 0,
          akbp: parseInt(element.dataValues.akbp) || 0,
          bripda: parseInt(element.dataValues.bripda) || 0,
          kp: parseInt(element.dataValues.kp) || 0,
          pns: parseInt(element.dataValues.pns) || 0,
          akp: parseInt(element.dataValues.akp) || 0,
          iptu: parseInt(element.dataValues.iptu) || 0,
          ipda: parseInt(element.dataValues.ipda) || 0,
          aiptu: parseInt(element.dataValues.aiptu) || 0,
          aipda: parseInt(element.dataValues.aipda) || 0,
          bripka: parseInt(element.dataValues.bripka) || 0,
          brigdr: parseInt(element.dataValues.brigdr) || 0,
          briptu: parseInt(element.dataValues.briptu) || 0,

          total:
            parseInt(element.dataValues.irjen) +
            parseInt(element.dataValues.brigjen) +
            parseInt(element.dataValues.kbp) +
            parseInt(element.dataValues.akbp) +
            parseInt(element.dataValues.bripda) +
            parseInt(element.dataValues.kp) +
            parseInt(element.dataValues.pns) +
            parseInt(element.dataValues.akp) +
            parseInt(element.dataValues.iptu) +
            parseInt(element.dataValues.ipda) +
            parseInt(element.dataValues.aiptu) +
            parseInt(element.dataValues.aipda) +
            parseInt(element.dataValues.bripka) +
            parseInt(element.dataValues.brigdr) +
            parseInt(element.dataValues.briptu),
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
          [Sequelize.fn("sum", Sequelize.col("irjen")), "irjen"],
          [Sequelize.fn("sum", Sequelize.col("brigjen")), "brigjen"],
          [Sequelize.fn("sum", Sequelize.col("kbp")), "kbp"],
          [Sequelize.fn("sum", Sequelize.col("akbp")), "akbp"],
          [Sequelize.fn("sum", Sequelize.col("bripda")), "bripda"],
          [Sequelize.fn("sum", Sequelize.col("kp")), "kp"],
          [Sequelize.fn("sum", Sequelize.col("pns")), "pns"],
          [Sequelize.fn("sum", Sequelize.col("akp")), "akp"],
          [Sequelize.fn("sum", Sequelize.col("iptu")), "iptu"],
          [Sequelize.fn("sum", Sequelize.col("ipda")), "ipda"],
          [Sequelize.fn("sum", Sequelize.col("aiptu")), "aiptu"],
          [Sequelize.fn("sum", Sequelize.col("aipda")), "aipda"],
          [Sequelize.fn("sum", Sequelize.col("bripka")), "bripka"],
          [Sequelize.fn("sum", Sequelize.col("brigdr")), "brigdr"],
          [Sequelize.fn("sum", Sequelize.col("briptu")), "briptu"],
          [
            Sequelize.literal(
              "SUM(irjen + brigjen + kbp + akbp + kp + akp + iptu + ipda + aiptu + aipda + bripka + brigdr + briptu + bripda + pns)"
            ),
            "total",
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
              date: data.date,

              irjen: parseInt(data.irjen) || 0,
              brigjen: parseInt(data.brigjen) || 0,
              kbp: parseInt(data.kbp) || 0,
              akbp: parseInt(data.akbp) || 0,
              bripda: parseInt(data.bripda) || 0,
              kp: parseInt(data.kp) || 0,
              pns: parseInt(data.pns) || 0,
              akp: parseInt(data.akp) || 0,
              iptu: parseInt(data.iptu) || 0,
              ipda: parseInt(data.ipda) || 0,
              aiptu: parseInt(data.aiptu) || 0,
              aipda: parseInt(data.aipda) || 0,
              bripka: parseInt(data.bripka) || 0,
              brigdr: parseInt(data.brigdr) || 0,
              briptu: parseInt(data.briptu) || 0,
              total:
                parseInt(data.irjen) +
                parseInt(data.brigjen) +
                parseInt(data.kbp) +
                parseInt(data.akbp) +
                parseInt(data.bripda) +
                parseInt(data.kp) +
                parseInt(data.pns) +
                parseInt(data.akp) +
                parseInt(data.iptu) +
                parseInt(data.ipda) +
                parseInt(data.aiptu) +
                parseInt(data.aipda) +
                arseInt(data.bripka) +
                parseInt(data.brigdr) +
                parseInt(data.briptu) || 0,
            });
          } else {
            finals.push({
              irjen: 0,
              brigjen: 0,
              kbp: 0,
              akbp: 0,
              bripda: 0,
              kp: 0,
              pns: 0,
              akp: 0,
              iptu: 0,
              ipda: 0,
              aiptu: 0,
              aipda: 0,
              bripka: 0,
              brigdr: 0,
              briptu: 0,
              total: 0,
              date: item,
            });
          }
        });
      } else if (type === "month") {
        let abc = rows.map((element, index) => {
          return {
            irjen: parseInt(element.dataValues.irjen) || 0,
            brigjen: parseInt(element.dataValues.brigjen) || 0,
            kbp: parseInt(element.dataValues.kbp) || 0,
            akbp: parseInt(element.dataValues.akbp) || 0,
            bripda: parseInt(element.dataValues.bripda) || 0,
            kp: parseInt(element.dataValues.kp) || 0,
            pns: parseInt(element.dataValues.pns) || 0,
            akp: parseInt(element.dataValues.akp) || 0,
            iptu: parseInt(element.dataValues.iptu) || 0,
            ipda: parseInt(element.dataValues.ipda) || 0,
            aiptu: parseInt(element.dataValues.aiptu) || 0,
            aipda: parseInt(element.dataValues.aipda) || 0,

            bripka: parseInt(element.dataValues.bripka) || 0,
            brigdr: parseInt(element.dataValues.brigdr) || 0,
            briptu: parseInt(element.dataValues.briptu) || 0,
            total:
              parseInt(element.dataValues.irjen) +
                parseInt(element.dataValues.brigjen) +
                parseInt(element.dataValues.kbp) +
                parseInt(element.dataValues.akbp) +
                parseInt(element.dataValues.bripda) +
                parseInt(element.dataValues.kp) +
                parseInt(element.dataValues.pns) +
                parseInt(element.dataValues.akp) +
                parseInt(element.dataValues.iptu) +
                parseInt(element.dataValues.ipda) +
                parseInt(element.dataValues.aiptu) +
                parseInt(element.dataValues.aipda) +
                arseInt(element.dataValues.bripka) +
                parseInt(element.dataValues.brigdr) +
                parseInt(element.dataValues.briptu) || 0,
            date: moment(element.dataValues.month).format("MMMM"),
          };
        });

        const asd = list_month.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              irjen: parseInt(data.irjen) || 0,
              brigjen: parseInt(data.brigjen) || 0,
              kbp: parseInt(data.kbp) || 0,
              akbp: parseInt(data.akbp) || 0,
              bripda: parseInt(data.bripda) || 0,
              kp: parseInt(data.kp) || 0,
              pns: parseInt(data.pns) || 0,
              akp: parseInt(data.akp) || 0,
              iptu: parseInt(data.iptu) || 0,
              ipda: parseInt(data.ipda) || 0,
              aiptu: parseInt(data.aiptu) || 0,
              aipda: parseInt(data.aipda) || 0,
              bripka: parseInt(data.bripka) || 0,
              brigdr: parseInt(data.brigdr) || 0,
              briptu: parseInt(data.briptu) || 0,
              total:
                parseInt(data.irjen) +
                  parseInt(data.brigjen) +
                  parseInt(data.kbp) +
                  parseInt(data.akbp) +
                  parseInt(data.bripda) +
                  parseInt(data.kp) +
                  parseInt(data.pns) +
                  parseInt(data.akp) +
                  parseInt(data.iptu) +
                  parseInt(data.ipda) +
                  parseInt(data.aiptu) +
                  parseInt(data.aipda) +
                  arseInt(data.bripka) +
                  parseInt(data.brigdr) +
                  parseInt(data.briptu) || 0,
              date: data.date,
            });
          } else {
            finals.push({
              irjen: 0,
              brigjen: 0,
              kbp: 0,
              akbp: 0,
              bripda: 0,
              kp: 0,
              pns: 0,
              akp: 0,
              iptu: 0,
              ipda: 0,
              aiptu: 0,
              aipda: 0,
              bripka: 0,
              brigdr: 0,
              briptu: 0,
              total: 0,
              date: item,
            });
          }
        });
      } else if (type === "year") {
        let abc = rows.map((element, index) => {
          return {
            irjen: parseInt(element.dataValues.irjen) || 0,
            brigjen: parseInt(element.dataValues.brigjen) || 0,
            kbp: parseInt(element.dataValues.kbp) || 0,
            akbp: parseInt(element.dataValues.akbp) || 0,
            bripda: parseInt(element.dataValues.bripda) || 0,
            kp: parseInt(element.dataValues.kp) || 0,
            pns: parseInt(element.dataValues.pns) || 0,
            akp: parseInt(element.dataValues.akp) || 0,
            iptu: parseInt(element.dataValues.iptu) || 0,
            ipda: parseInt(element.dataValues.ipda) || 0,
            aiptu: parseInt(element.dataValues.aiptu) || 0,
            aipda: parseInt(element.dataValues.aipda) || 0,
            bripka: parseInt(element.dataValues.bripka) || 0,
            brigdr: parseInt(element.dataValues.brigdr) || 0,
            briptu: parseInt(element.dataValues.briptu) || 0,
            total:
              parseInt(element.dataValues.irjen) +
                parseInt(element.dataValues.brigjen) +
                parseInt(element.dataValues.kbp) +
                parseInt(element.dataValues.akbp) +
                parseInt(element.dataValues.bripda) +
                parseInt(element.dataValues.kp) +
                parseInt(element.dataValues.pns) +
                parseInt(element.dataValues.akp) +
                parseInt(element.dataValues.iptu) +
                parseInt(element.dataValues.ipda) +
                parseInt(element.dataValues.aiptu) +
                parseInt(element.dataValues.aipda) +
                arseInt(element.dataValues.bripka) +
                parseInt(element.dataValues.brigdr) +
                parseInt(element.dataValues.briptu) || 0,
            date: moment(element.dataValues.year).format("YYYY"),
          };
        });

        const asd = list_year.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              irjen: parseInt(data.irjen) || 0,
              brigjen: parseInt(data.brigjen) || 0,
              kbp: parseInt(data.kbp) || 0,
              akbp: parseInt(data.akbp) || 0,
              bripda: parseInt(data.bripda) || 0,
              kp: parseInt(data.kp) || 0,
              pns: parseInt(data.pns) || 0,
              akp: parseInt(data.akp) || 0,
              iptu: parseInt(data.iptu) || 0,
              ipda: parseInt(data.ipda) || 0,
              aiptu: parseInt(data.aiptu) || 0,
              aipda: parseInt(data.aipda) || 0,
              bripka: parseInt(data.bripka) || 0,
              brigdr: parseInt(data.brigdr) || 0,
              briptu: parseInt(data.briptu) || 0,
              total:
                parseInt(data.irjen) +
                  parseInt(data.brigjen) +
                  parseInt(data.kbp) +
                  parseInt(data.akbp) +
                  parseInt(data.bripda) +
                  parseInt(data.kp) +
                  parseInt(data.pns) +
                  parseInt(data.akp) +
                  parseInt(data.iptu) +
                  parseInt(data.ipda) +
                  parseInt(data.aiptu) +
                  parseInt(data.aipda) +
                  arseInt(data.bripka) +
                  parseInt(data.brigdr) +
                  parseInt(data.briptu) || 0,
              date: data.date,
            });
          } else {
            finals.push({
              irjen: 0,
              brigjen: 0,
              kbp: 0,
              akbp: 0,
              bripda: 0,
              kp: 0,
              pns: 0,
              akp: 0,
              iptu: 0,
              ipda: 0,
              aiptu: 0,
              aipda: 0,
              bripka: 0,
              brigdr: 0,
              briptu: 0,
              total: 0,
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

  static add = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let dataInputPolda = [];
      req.body?.value.map((item) => {
        dataInputPolda.push({
          polda_id: decAes(item.polda_id),
          date: item.date,

          irjen: item.irjen,
          baru_c: item.baru_c,
          brigjen: item.brigjen,
          kbp: item.kbp,
          baru_d: item.baru_d,
          akbp: item.akbp,

          bripda: item.bripda,
          kp: item.kp,
          pns: item.pns,
          akp: item.akp,
          iptu: item.iptu,
          perpanjangan_d: item.perpanjangan_d,
          ipda: item.ipda,
          perpanjangan_b1: item.perpanjangan_b1,
          aiptu: item.aiptu,
          perpanjangan_b2: item.aipda,
          aipda: item.aipda,

          bripka: item.bripka,
          peningkatan_b1: item.peningkatan_b1,
          brigdr: item.brigdr,
          peningkatan_b2: item.peningkatan_b2,
          briptu: item.briptu,
        });
      });
      // let insertDataPolda = await Count_polda_day.bulkCreate(dataInputPolda, {
      //   transaction: transaction,
      // });

      console.log(dataInputPolda);

      // await transaction.commit();
      response(res, true, "Succeed", null);
    } catch (error) {
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };
};
