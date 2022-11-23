const cron = require("node-cron");
const db = require("../config/database");
const moment = require("moment");

const Master_turjagwali = require("../model/input_turjagwali");
const Count_polda_day = require("../model/count_turjagwali_polda_day");
const Count_polda_month = require("../model/count_turjagwali_polda_month");
const Count_polres_month = require("../model/count_turjagwali_polres_month");
const { Op } = require("sequelize");
exports.cronTurjagwali = () => {
  const scheduledJobFunction = cron.schedule(" */1 * * * *", () => {
    console.log("Cron turjagwali is running");
    update_polda_day();
    update_polres_month();
  });

  const scheduledJobFunction2 = cron.schedule(" */2 * * * *", () => {
    update_polda_month();
  });

  scheduledJobFunction.start();
  scheduledJobFunction2.start();
};

async function update_polda_day() {
  console.log("update turjagwali day by polda is running");
  const transaction = await db.transaction();

  let allTurjagwali = await Master_turjagwali.findAll();

  let result = allTurjagwali.filter(function (items) {
    return items.dataValues.date == moment().format("YYYY-MM-DD");
  });

  if (result) {
    let final = Object.values(
      result.reduce((a, { polda_id, ...props }) => {
        if (!a[polda_id])
          a[polda_id] = Object.assign({}, { polda_id, data: [props] });
        else a[polda_id].data.push(props);
        return a;
      }, {})
    );

    const finalResult = [];

    final.forEach((item) => {
      var pengawalan = 0;
      var patroli = 0;
      var pengaturan = 0;
      var penjagaan = 0;
      item.data.forEach((itm) => {
        pengawalan += itm.dataValues.pengawalan;
        patroli += itm.dataValues.patroli;
        pengaturan += itm.dataValues.pengaturan;
        penjagaan += itm.dataValues.penjagaan;
      });

      finalResult.push({
        polda_id: item.polda_id,
        pengawalan: pengawalan,
        patroli: patroli,
        pengaturan: pengaturan,
        date: moment().format("YYYY-MM-DD"),
        penjagaan: penjagaan,
      });
    });

    let insertData = await Count_polda_day.bulkCreate(finalResult, {
      transaction: transaction,
    });
    await transaction.commit();
  } else {
    console.log("data gada");
  }
}

async function update_polda_month() {
  console.log("update turjagwali month by polda is running");
  const transaction = await db.transaction();
  const startOfMonth = moment().startOf("month").format("YYYY-MM-DD");
  const endOfMonth = moment().endOf("month").format("YYYY-MM-DD");
  let allCountPoldaDay = await Master_turjagwali.findAll({
    where: {
      date: {
        [Op.between]: [startOfMonth, endOfMonth],
      },
    },
  });

  if (allCountPoldaDay) {
    let final = Object.values(
      allCountPoldaDay.reduce((a, { polda_id, ...props }) => {
        if (!a[polda_id])
          a[polda_id] = Object.assign({}, { polda_id, data: [props] });
        else a[polda_id].data.push(props);
        return a;
      }, {})
    );

    const finalResult = [];

    final.forEach((item) => {
      var pengawalan = 0;
      var patroli = 0;
      var pengaturan = 0;
      var penjagaan = 0;
      item.data.forEach((itm) => {
        pengawalan += itm.dataValues.pengawalan;
        patroli += itm.dataValues.patroli;
        pengaturan += itm.dataValues.pengaturan;
        penjagaan += itm.dataValues.penjagaan;
      });

      finalResult.push({
        polda_id: item.polda_id,
        pengawalan: pengawalan,
        patroli: patroli,
        pengaturan: pengaturan,
        date: moment().endOf("month").format("YYYY-MM-DD"),
        penjagaan: penjagaan,
      });
    });

    finalResult.forEach((element) => {
      let checkData = Count_polda_month.findOne({
        where: {
          polda_id: element.polda_id,
          date: moment().endOf("month").format("YYYY-MM-DD"),
        },
      });

      checkData.then(function (params) {
        if (params) {
          console.log("Turjagwali polda month is update");
          Count_polda_month.update(element, {
            where: {
              polda_id: params.dataValues.polda_id,
              date: params.dataValues.date,
            },
          });
        } else {
          console.log("Turjagwali polda month is create");
          Count_polda_month.create(element);
        }
      });
    });
    await transaction.commit();
  } else {
    console.log("data gada");
  }
}

async function update_polres_month() {
  console.log("update month by polres is running");
  const transaction = await db.transaction();
  const startOfMonth = moment().startOf("month").format("YYYY-MM-DD");
  const endOfMonth = moment().endOf("month").format("YYYY-MM-DD");

  let allPolresOneMonth = await Master_turjagwali.findAll({
    where: {
      date: {
        [Op.between]: [startOfMonth, endOfMonth],
      },
    },
  });

  if (allPolresOneMonth) {
    let final = Object.values(
      allPolresOneMonth.reduce((a, { polres_id, ...props }) => {
        if (!a[polres_id])
          a[polres_id] = Object.assign({}, { polres_id, data: [props] });
        else a[polres_id].data.push(props);
        return a;
      }, {})
    );

    const finalResult = [];

    final.forEach((item) => {
      var pengawalan = 0;
      var patroli = 0;
      var pengaturan = 0;
      var penjagaan = 0;
      item.data.forEach((itm) => {
        polda_id = itm.dataValues.polda_id;
        pengawalan += itm.dataValues.pengawalan;
        patroli += itm.dataValues.patroli;
        pengaturan += itm.dataValues.pengaturan;
        penjagaan += itm.dataValues.penjagaan;
      });

      finalResult.push({
        polda_id: polda_id,
        polres_id: item.polres_id,
        pengawalan: pengawalan,
        patroli: patroli,
        pengaturan: pengaturan,
        date: moment().endOf("month").format("YYYY-MM-DD"),
        penjagaan: penjagaan,
      });
    });

    finalResult.forEach((element) => {
      let checkData = Count_polres_month.findOne({
        where: {
          polda_id: element.polda_id,
          polres_id: element.polres_id,
          date: moment().endOf("month").format("YYYY-MM-DD"),
        },
      });

      checkData.then(function (params) {
        if (params) {
          console.log("Turjagwali polres month is update");
          Count_polres_month.update(element, {
            where: {
              polda_id: params.dataValues.polda_id,
              date: params.dataValues.date,
              polres_id: params.dataValues.polres_id,
            },
          });
        } else {
          console.log("Turjagwali polres month is create");
          Count_polres_month.create(element);
        }
      });
    });
  } else {
    console.log("data gada");
  }

  await transaction.commit();
}
