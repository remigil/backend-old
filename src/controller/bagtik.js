const db = require("../config/database");
const response = require("../lib/response");
const moment = require("moment");
const { Op, Sequelize } = require("sequelize");
const _ = require("lodash");
const { AESDecrypt } = require("../lib/encryption");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");

const Bagtik_cctv = require("../model/bagtik_cctv");
const Bagtik_cctvintegrasi = require("../model/bagtik_cctvintegrasi");
const Bagtik_rtmc = require("../model/bagtik_rtmc");
const Bagtik_tmc = require("../model/bagtik_tmc");

const Polda = require("../model/polda");
const Polres = require("../model/polres");

Polda.hasMany(Bagtik_cctv, { foreignKey: "polda_id", as: "bagtik_cctv" });
Polda.hasMany(Bagtik_cctvintegrasi, {
  foreignKey: "polda_id",
  as: "bagtik_cctvintegrasi",
});
Polda.hasMany(Bagtik_rtmc, {
  foreignKey: "polda_id",
  as: "bagtik_rtmc",
});
Polda.hasMany(Bagtik_tmc, {
  foreignKey: "polda_id",
  as: "bagtik_tmc",
});

const decAes = (token) =>
  AESDecrypt(token, {
    isSafeUrl: true,
    parseMode: "string",
  });
module.exports = class BpkbController {
  static get_daily_cctv = async (req, res) => {
    const modelAttr = Object.keys(Bagtik_cctv.getAttributes());
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
        newest = null,
      } = req.query;
      const getDataRules = {
        group: ["polda.id"],
        attributes: [
          "id",
          "name_polda",
          [Sequelize.fn("sum", Sequelize.col("jumlah")), "jumlah"],
        ],
        include: [
          {
            model: Bagtik_cctv,
            required: false,
            as: "bagtik_cctv",
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

      if (newest) {
        let checkData = await Bagtik_cctv.findAll({
          limit: 1,
          order: [["date", "DESC"]],
        });
        let asd_date = checkData[0].dataValues.date;
        let zxc_date = checkData[0].dataValues.date;

        getDataRules.include[0].where = {
          date: {
            [Op.between]: [asd_date, zxc_date],
          },
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
          jumlah: parseInt(element.dataValues.jumlah) || 0,
        });
      });

      if (topPolda) {
        rows.sort((a, b) => b.jumlah - a.jumlah);
        rows = rows.slice(0, limit);
      }
      response(res, true, "Succeed", {
        rows,
        recordsFiltered: count,
        recordsjumlah: count,
      });
    } catch (error) {
      response(res, false, "Failed", error.message);
    }
  };

  static get_by_date_cctv = async (req, res) => {
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
        attributes: [[Sequelize.fn("sum", Sequelize.col("jumlah")), "jumlah"]],
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

      let rows = await Bagtik_cctv.findAll(getDataRules);

      let finals = [];
      if (type === "day") {
        const asd = list_day.map((item, index) => {
          const data = rows.find((x) => x.dataValues.date == item);
          if (data) {
            finals.push({
              jumlah: parseInt(data.jumlah),
              date: data.date,
            });
          } else {
            finals.push({
              jumlah: 0,
              date: item,
            });
          }
        });
      } else if (type === "month") {
        let abc = rows.map((element, index) => {
          return {
            jumlah: parseInt(element.dataValues.jumlah),
            date: moment(element.dataValues.month).format("MMMM"),
          };
        });

        const asd = list_month.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              jumlah: parseInt(data.jumlah),
              date: data.date,
            });
          } else {
            finals.push({
              jumlah: 0,
              date: item,
            });
          }
        });
      } else if (type === "year") {
        let abc = rows.map((element, index) => {
          return {
            jumlah: parseInt(element.dataValues.jumlah),
            date: moment(element.dataValues.year).format("YYYY"),
          };
        });

        const asd = list_year.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              jumlah: parseInt(data.jumlah),
              date: data.date,
            });
          } else {
            finals.push({
              jumlah: 0,
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

  static add_cctv = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let dataInputPolda = [];
      let date = "";

      req.body?.value.map((item) => {
        date = item.date;
        dataInputPolda.push({
          polda_id: decAes(item.polda_id),
          date: item.date,
          jumlah: item.jumlah,
        });
      });
      let checkData = await Bagtik_cctv.findAll({
        where: {
          date: date,
        },
      });

      console.log(dataInputPolda);

      if (checkData.length > 0) {
        let hapus = await Bagtik_cctv.destroy({
          where: {
            date: date,
          },
        });
        let insertDataPolda = await Bagtik_cctv.bulkCreate(dataInputPolda, {
          transaction: transaction,
        });
      } else {
        let insertDataPolda = await Bagtik_cctv.bulkCreate(dataInputPolda, {
          transaction: transaction,
        });
      }
      await transaction.commit();
      response(res, true, "Succeed", null);
    } catch (error) {
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  // CCTV INTEGRASI
  static get_daily_cctvintegrasi = async (req, res) => {
    const modelAttr = Object.keys(Bagtik_cctv.getAttributes());
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
        newest = null,
      } = req.query;
      const getDataRules = {
        group: ["polda.id"],
        attributes: [
          "id",
          "name_polda",
          [Sequelize.fn("sum", Sequelize.col("jumlah")), "jumlah"],
        ],
        include: [
          {
            model: Bagtik_cctvintegrasi,
            required: false,
            as: "bagtik_cctvintegrasi",
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

      if (newest) {
        let checkData = await Bagtik_cctvintegrasi.findAll({
          limit: 1,
          order: [["date", "DESC"]],
        });
        let asd_date = checkData[0].dataValues.date;
        let zxc_date = checkData[0].dataValues.date;

        getDataRules.include[0].where = {
          date: {
            [Op.between]: [asd_date, zxc_date],
          },
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
          jumlah: parseInt(element.dataValues.jumlah) || 0,
        });
      });

      if (topPolda) {
        rows.sort((a, b) => b.jumlah - a.jumlah);
        rows = rows.slice(0, limit);
      }
      response(res, true, "Succeed", {
        rows,
        recordsFiltered: count,
        recordsjumlah: count,
      });
    } catch (error) {
      response(res, false, "Failed", error.message);
    }
  };

  static get_by_date_cctvintegrasi = async (req, res) => {
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
        attributes: [[Sequelize.fn("sum", Sequelize.col("jumlah")), "jumlah"]],
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

      let rows = await Bagtik_cctvintegrasi.findAll(getDataRules);

      let finals = [];
      if (type === "day") {
        const asd = list_day.map((item, index) => {
          const data = rows.find((x) => x.dataValues.date == item);
          if (data) {
            finals.push({
              jumlah: parseInt(data.jumlah),
              date: data.date,
            });
          } else {
            finals.push({
              jumlah: 0,
              date: item,
            });
          }
        });
      } else if (type === "month") {
        let abc = rows.map((element, index) => {
          return {
            jumlah: parseInt(element.dataValues.jumlah),
            date: moment(element.dataValues.month).format("MMMM"),
          };
        });

        const asd = list_month.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              jumlah: parseInt(data.jumlah),
              date: data.date,
            });
          } else {
            finals.push({
              jumlah: 0,
              date: item,
            });
          }
        });
      } else if (type === "year") {
        let abc = rows.map((element, index) => {
          return {
            jumlah: parseInt(element.dataValues.jumlah),
            date: moment(element.dataValues.year).format("YYYY"),
          };
        });

        const asd = list_year.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              jumlah: parseInt(data.jumlah),
              date: data.date,
            });
          } else {
            finals.push({
              jumlah: 0,
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

  static add_cctvintegrasi = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let dataInputPolda = [];
      let date = "";

      req.body?.value.map((item) => {
        date = item.date;
        dataInputPolda.push({
          polda_id: decAes(item.polda_id),
          date: item.date,
          jumlah: item.jumlah,
        });
      });
      let checkData = await Bagtik_cctvintegrasi.findAll({
        where: {
          date: date,
        },
      });

      console.log(dataInputPolda);

      if (checkData.length > 0) {
        let hapus = await Bagtik_cctvintegrasi.destroy({
          where: {
            date: date,
          },
        });
        let insertDataPolda = await Bagtik_cctvintegrasi.bulkCreate(
          dataInputPolda,
          {
            transaction: transaction,
          }
        );
      } else {
        let insertDataPolda = await Bagtik_cctvintegrasi.bulkCreate(
          dataInputPolda,
          {
            transaction: transaction,
          }
        );
      }
      await transaction.commit();
      response(res, true, "Succeed", null);
    } catch (error) {
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  // RTMC
  static get_daily_rtmc = async (req, res) => {
    const modelAttr = Object.keys(Bagtik_rtmc.getAttributes());
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
        newest = null,
      } = req.query;
      const getDataRules = {
        group: ["polda.id"],
        attributes: [
          "id",
          "name_polda",
          [Sequelize.fn("sum", Sequelize.col("jumlah")), "jumlah"],
        ],
        include: [
          {
            model: Bagtik_rtmc,
            required: false,
            as: "bagtik_rtmc",
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

      if (newest) {
        let checkData = await Bagtik_rtmc.findAll({
          limit: 1,
          order: [["date", "DESC"]],
        });
        let asd_date = checkData[0].dataValues.date;
        let zxc_date = checkData[0].dataValues.date;

        getDataRules.include[0].where = {
          date: {
            [Op.between]: [asd_date, zxc_date],
          },
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
          jumlah: parseInt(element.dataValues.jumlah) || 0,
        });
      });

      if (topPolda) {
        rows.sort((a, b) => b.jumlah - a.jumlah);
        rows = rows.slice(0, limit);
      }
      response(res, true, "Succeed", {
        rows,
        recordsFiltered: count,
        recordsjumlah: count,
      });
    } catch (error) {
      response(res, false, "Failed", error.message);
    }
  };

  static get_by_date_rtmc = async (req, res) => {
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
        attributes: [[Sequelize.fn("sum", Sequelize.col("jumlah")), "jumlah"]],
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

      let rows = await Bagtik_rtmc.findAll(getDataRules);

      let finals = [];
      if (type === "day") {
        const asd = list_day.map((item, index) => {
          const data = rows.find((x) => x.dataValues.date == item);
          if (data) {
            finals.push({
              jumlah: parseInt(data.jumlah),
              date: data.date,
            });
          } else {
            finals.push({
              jumlah: 0,
              date: item,
            });
          }
        });
      } else if (type === "month") {
        let abc = rows.map((element, index) => {
          return {
            jumlah: parseInt(element.dataValues.jumlah),
            date: moment(element.dataValues.month).format("MMMM"),
          };
        });

        const asd = list_month.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              jumlah: parseInt(data.jumlah),
              date: data.date,
            });
          } else {
            finals.push({
              jumlah: 0,
              date: item,
            });
          }
        });
      } else if (type === "year") {
        let abc = rows.map((element, index) => {
          return {
            jumlah: parseInt(element.dataValues.jumlah),
            date: moment(element.dataValues.year).format("YYYY"),
          };
        });

        const asd = list_year.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              jumlah: parseInt(data.jumlah),
              date: data.date,
            });
          } else {
            finals.push({
              jumlah: 0,
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

  static add_rtmc = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let dataInputPolda = [];
      let date = "";

      req.body?.value.map((item) => {
        date = item.date;
        dataInputPolda.push({
          polda_id: decAes(item.polda_id),
          date: item.date,
          jumlah: item.jumlah,
        });
      });
      let checkData = await Bagtik_rtmc.findAll({
        where: {
          date: date,
        },
      });

      console.log(dataInputPolda);

      if (checkData.length > 0) {
        let hapus = await Bagtik_rtmc.destroy({
          where: {
            date: date,
          },
        });
        let insertDataPolda = await Bagtik_rtmc.bulkCreate(dataInputPolda, {
          transaction: transaction,
        });
      } else {
        let insertDataPolda = await Bagtik_rtmc.bulkCreate(dataInputPolda, {
          transaction: transaction,
        });
      }
      await transaction.commit();
      response(res, true, "Succeed", null);
    } catch (error) {
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };

  // TMC
  static get_daily_tmc = async (req, res) => {
    const modelAttr = Object.keys(Bagtik_tmc.getAttributes());
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
        newest = null,
      } = req.query;
      const getDataRules = {
        group: ["polda.id"],
        attributes: [
          "id",
          "name_polda",
          [Sequelize.fn("sum", Sequelize.col("jumlah")), "jumlah"],
        ],
        include: [
          {
            model: Bagtik_tmc,
            required: false,
            as: "bagtik_tmc",
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

      if (newest) {
        let checkData = await Bagtik_tmc.findAll({
          limit: 1,
          order: [["date", "DESC"]],
        });
        let asd_date = checkData[0].dataValues.date;
        let zxc_date = checkData[0].dataValues.date;

        getDataRules.include[0].where = {
          date: {
            [Op.between]: [asd_date, zxc_date],
          },
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
          jumlah: parseInt(element.dataValues.jumlah) || 0,
        });
      });

      if (topPolda) {
        rows.sort((a, b) => b.jumlah - a.jumlah);
        rows = rows.slice(0, limit);
      }
      response(res, true, "Succeed", {
        rows,
        recordsFiltered: count,
        recordsjumlah: count,
      });
    } catch (error) {
      response(res, false, "Failed", error.message);
    }
  };

  static get_by_date_tmc = async (req, res) => {
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
        attributes: [[Sequelize.fn("sum", Sequelize.col("jumlah")), "jumlah"]],
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

      let rows = await Bagtik_tmc.findAll(getDataRules);

      let finals = [];
      if (type === "day") {
        const asd = list_day.map((item, index) => {
          const data = rows.find((x) => x.dataValues.date == item);
          if (data) {
            finals.push({
              program_kegiatan: parseInt(data.program_kegiatan),
              jumlah: parseInt(data.jumlah),
              date: data.date,
            });
          } else {
            finals.push({
              jumlah: 0,
              date: item,
            });
          }
        });
      } else if (type === "month") {
        let abc = rows.map((element, index) => {
          return {
            jumlah: parseInt(element.dataValues.jumlah),
            date: moment(element.dataValues.month).format("MMMM"),
          };
        });

        const asd = list_month.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              jumlah: parseInt(data.jumlah),
              date: data.date,
            });
          } else {
            finals.push({
              jumlah: 0,
              date: item,
            });
          }
        });
      } else if (type === "year") {
        let abc = rows.map((element, index) => {
          return {
            jumlah: parseInt(element.dataValues.jumlah),
            date: moment(element.dataValues.year).format("YYYY"),
          };
        });

        const asd = list_year.map((item, index) => {
          const data = abc.find((x) => x.date == item);
          if (data) {
            finals.push({
              jumlah: parseInt(data.jumlah),
              date: data.date,
            });
          } else {
            finals.push({
              jumlah: 0,
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

  static add_tmc = async (req, res) => {
    const transaction = await db.transaction();
    try {
      let dataInputPolda = [];
      let date = "";

      req.body?.value.map((item) => {
        date = item.date;
        dataInputPolda.push({
          polda_id: decAes(item.polda_id),
          date: item.date,
          jumlah: item.jumlah,
        });
      });
      let checkData = await Bagtik_tmc.findAll({
        where: {
          date: date,
        },
      });

      console.log(dataInputPolda);

      if (checkData.length > 0) {
        let hapus = await Bagtik_tmc.destroy({
          where: {
            date: date,
          },
        });
        let insertDataPolda = await Bagtik_tmc.bulkCreate(dataInputPolda, {
          transaction: transaction,
        });
      } else {
        let insertDataPolda = await Bagtik_tmc.bulkCreate(dataInputPolda, {
          transaction: transaction,
        });
      }
      await transaction.commit();
      response(res, true, "Succeed", null);
    } catch (error) {
      await transaction.rollback();
      response(res, false, "Failed", error.message);
    }
  };
};
