const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const Input_bpkb = require("../model/input_bpkb");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");

const Count_polda_day = require("../model/bagrenmin_rengar");

const Polda = require("../model/polda");
const Polres = require("../model/polres");

Polda.hasMany(Count_polda_day, { foreignKey: "polda_id", as: "rengar" });

const decAes = (token) =>
  AESDecrypt(token, {
    isSafeUrl: true,
    parseMode: "string",
  });
module.exports = class BpkbController {
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
            Sequelize.fn("sum", Sequelize.col("program_kegiatan")),
            "program_kegiatan",
          ],
          [
            Sequelize.fn("sum", Sequelize.col("belanja_barang")),
            "belanja_barang",
          ],
          [
            Sequelize.fn("sum", Sequelize.col("belanja_modal")),
            "belanja_modal",
          ],
          [Sequelize.fn("sum", Sequelize.col("gaji_pegawai")), "gaji_pegawai"],
          [
            Sequelize.literal(
              "SUM(program_kegiatan + belanja_barang + belanja_modal + gaji_pegawai)"
            ),
            "total",
          ],
        ],
        include: [
          {
            model: Count_polda_day,
            required: false,
            as: "rengar",
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
          program_kegiatan: parseInt(element.dataValues.program_kegiatan) || 0,
          belanja_barang: parseInt(element.dataValues.belanja_barang) || 0,
          belanja_modal: parseInt(element.dataValues.belanja_modal) || 0,
          gaji_pegawai: parseInt(element.dataValues.gaji_pegawai) || 0,
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
            Sequelize.fn("sum", Sequelize.col("program_kegiatan")),
            "program_kegiatan",
          ],
          [
            Sequelize.fn("sum", Sequelize.col("belanja_barang")),
            "belanja_barang",
          ],
          [
            Sequelize.fn("sum", Sequelize.col("belanja_modal")),
            "belanja_modal",
          ],
          [Sequelize.fn("sum", Sequelize.col("gaji_pegawai")), "gaji_pegawai"],
          [
            Sequelize.literal(
              "SUM(gaji_pegawai + belanja_barang + belanja_modal + gaji_pegawai)"
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
              program_kegiatan: parseInt(data.program_kegiatan),
              belanja_modal: parseInt(data.belanja_modal),
              belanja_barang: parseInt(data.belanja_barang),
              gaji_pegawai: parseInt(data.gaji_pegawai),
              total: parseInt(data.total),
              date: data.date,
            });
          } else {
            finals.push({
              program_kegiatan: 0,
              belanja_modal: 0,
              belanja_barang: 0,
              gaji_pegawai: 0,
              total: 0,
              date: item,
            });
          }
        });
      } else if (type === "month") {
        let abc = rows.map((element, index) => {
          return {
            program_kegiatan: parseInt(element.dataValues.program_kegiatan),
            belanja_modal: parseInt(element.dataValues.belanja_modal),
            belanja_barang: parseInt(element.dataValues.belanja_barang),
            gaji_pegawai: parseInt(element.dataValues.gaji_pegawai),
            total: parseInt(element.dataValues.total),
            date: moment(element.dataValues.month).format("MMMM"),
          };
        });

        const asd = list_month.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              program_kegiatan: parseInt(data.program_kegiatan),
              belanja_modal: parseInt(data.belanja_modal),
              belanja_barang: parseInt(data.belanja_barang),
              gaji_pegawai: parseInt(data.gaji_pegawai),
              total: parseInt(data.total),
              date: data.date,
            });
          } else {
            finals.push({
              program_kegiatan: 0,
              belanja_modal: 0,
              belanja_barang: 0,
              gaji_pegawai: 0,
              total: 0,
              date: item,
            });
          }
        });
      } else if (type === "year") {
        let abc = rows.map((element, index) => {
          return {
            program_kegiatan: parseInt(element.dataValues.program_kegiatan),
            belanja_modal: parseInt(element.dataValues.belanja_modal),
            belanja_barang: parseInt(element.dataValues.belanja_barang),
            gaji_pegawai: parseInt(element.dataValues.gaji_pegawai),
            total: parseInt(element.dataValues.total),
            date: moment(element.dataValues.month).format("YYYY"),
          };
        });

        const asd = list_year.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              program_kegiatan: parseInt(data.program_kegiatan),
              belanja_modal: parseInt(data.belanja_modal),
              belanja_barang: parseInt(data.belanja_barang),
              gaji_pegawai: parseInt(data.gaji_pegawai),
              total: parseInt(data.total),
              date: data.date,
            });
          } else {
            finals.push({
              program_kegiatan: 0,
              belanja_modal: 0,
              belanja_barang: 0,
              gaji_pegawai: 0,
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
  //           program_kegiatan: item.program_kegiatan,
  //           belanja_barang: item.belanja_barang,
  //           belanja_modal: item.belanja_modal,
  //         });
  //       });
  //       let insertDataPolda = await Input_bpkb.bulkCreate(dataInputPolda, {
  //         transaction: transaction,
  //       });
  //     } else {
  //       let checkData = await Input_bpkb.findOne({
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
  //         program_kegiatan: req.body.program_kegiatan,
  //         belanja_barang: req.body.belanja_barang,
  //         belanja_modal: req.body.belanja_modal,
  //       };
  //       if (checkData) {
  //         let updateData = await Input_bpkb.update(inputData, {
  //           where: {
  //             polda_id: decAes(req.body.polda_id),
  //             polres_id: decAes(req.body.polres_id),
  //             date: req.body.date,
  //           },
  //           transaction: transaction,
  //         });
  //       } else {
  //         let insertData = await Input_bpkb.create(inputData, {
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
    try {
      const transaction = await db.transaction();
      let dataInputPolda = [];
      req.body?.value.map((item) => {
        dataInputPolda.push({
          polda_id: decAes(item.polda_id),
          date: item.date,
          program_kegiatan: item.program_kegiatan,
          belanja_barang: item.belanja_barang,
          belanja_modal: item.belanja_modal,
          gaji_pegawai: item.gaji_pegawai,
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
