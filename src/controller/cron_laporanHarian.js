const cron = require("node-cron");
const db = require("../config/database");
const moment = require("moment");
const { default: axios } = require("axios");
const { namePolda } = require("../lib/polda_nameParse");

const Laporan_harian = require("../model/laporan_harian");

const { Op, Sequelize } = require("sequelize");
exports.Laporan_Harian = () => {
  const scheduledJobFunction = cron.schedule(
    "30 23 * * *",
    () => {
      console.log("Cron ng");
      // update_polda_month();
      laporan_harian_day();
    },
    {
      scheduled: true,
      timezone: "Asia/Jakarta",
    }
  );

  const scheduledJobFunction2 = cron.schedule(
    "35 23 * * *",
    () => {
      console.log("Cronasf ng");
      // update_polda_month();
      laporan_harian_month();
    },
    {
      scheduled: true,
      timezone: "Asia/Jakarta",
    }
  );

  const scheduledJobFunction3 = cron.schedule(
    "40 23 * * *",
    () => {
      console.log("Cron ng");
      // update_polda_month();
      laporan_harian_year();
    },
    {
      scheduled: true,
      timezone: "Asia/Jakarta",
    }
  );

  scheduledJobFunction.start();
  scheduledJobFunction2.start();
  scheduledJobFunction3.start();
};

const laporan_harian_day = async () => {
  try {
    const transaction = await db.transaction();
    let data = {
      date: moment().format("YYYY-MM-DD"),
      kategori_laporan: 1,
      judul: "Laporan Harian " + moment().format("YYYY-MM-DD"),
      url: "laporan_harian/export_laphar?date=" + moment().format("YYYY-MM-DD"),
    };
    let op = await Laporan_harian.create(data, {
      transaction: transaction,
    });
    await transaction.commit();
    if (op) {
      console.log("ok");
    } else {
      throw new Error("gagal");
    }
  } catch (error) {
    await transaction.rollback();
    console.log(error);
  }
};

const laporan_harian_month = async () => {
  try {
    const transaction = await db.transaction();
    let data = {
      date: moment().endOf("month").format("YYYY-MM-DD"),
      kategori_laporan: 2,
      judul:
        "Laporan Harian Bulan " + moment().locale("id").format("MMMM YYYY"),
      url: `laporan_harian/export_laphar?filter=true&start_date=${moment()
        .startOf("month")
        .format("YYYY-MM-DD")}&end_date=${moment()
        .endOf("month")
        .format("YYYY-MM-DD")}`,
    };

    let checkData = await Laporan_harian.findOne({
      where: {
        date: moment().endOf("month").format("YYYY-MM-DD"),
        kategori_laporan: 2,
      },
    });

    if (!checkData) {
      let op = await Laporan_harian.create(data, {
        transaction: transaction,
      });
      await transaction.commit();
    }
  } catch (error) {
    await transaction.rollback();
    console.log(error);
  }
};

const laporan_harian_year = async () => {
  try {
    const transaction = await db.transaction();
    let data = {
      date: moment().endOf("year").format("YYYY-MM-DD"),
      kategori_laporan: 3,
      judul: "Laporan Harian Tahun " + moment().locale("id").format("YYYY"),
      url: `laporan_harian/export_laphar?filter=true&start_date=${moment()
        .startOf("year")
        .format("YYYY-MM-DD")}&end_date=${moment()
        .endOf("year")
        .format("YYYY-MM-DD")}`,
    };

    let checkData = await Laporan_harian.findOne({
      where: {
        date: moment().endOf("year").format("YYYY-MM-DD"),
        kategori_laporan: 3,
      },
    });

    if (!checkData) {
      let op = await Laporan_harian.create(data, {
        transaction: transaction,
      });
      await transaction.commit();
    }
  } catch (error) {
    await transaction.rollback();
    console.log(error);
  }
};
