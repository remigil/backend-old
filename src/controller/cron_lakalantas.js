const cron = require("node-cron");
const db = require("../config/database");
const moment = require("moment");
const { default: axios } = require("axios");
const { namePolda } = require("../lib/polda_nameParse");

const response = require("../lib/response");

const Count_polda_day = require("../model/count_lakalantas_polda_day");
const Count_polda_month = require("../model/count_lakalantas_polda_month");
const Polda = require("../model/polda");
const { Op, Sequelize } = require("sequelize");
exports.cronLakalantas = () => {
  const scheduledJobFunction = cron.schedule(
    "0 */2 * * *",
    () => {
      console.log("Cron lakalantas is running");
      // update_polda_month();
      update_polda_day();
    },
    {
      scheduled: true,
      timezone: "Asia/Jakarta",
    }
  );

  const scheduledJobFunction2 = cron.schedule(
    "20 23 * * *",
    () => {
      console.log("Cron lakalantas is running");
      update_polda_month();
    },
    {
      scheduled: true,
      timezone: "Asia/Jakarta",
    }
  );

  scheduledJobFunction.start();
  scheduledJobFunction2.start();
};

const update_polda_day = async () => {
  const transaction = await db.transaction();
  try {
    let getIrsms = await axios.get(
      "https://irsms.korlantas.polri.go.id/irsmsapi/api/bagops"
    );

    var filterIrsms = await getIrsms.data["result"].filter(function (e) {
      return e.tgl_kejadian != null && e.name != "TOTAL";
    });

    let finals = await filterIrsms.map((Element, index) => {
      let a = namePolda(Element.name);
      date = Element.tgl_kejadian.split("/").reverse().join("-");
      // let date = moment(d).format('YYYY-MM-DD') ;)
      return {
        ...a,
        ...Element,
        date,
      };
    });

    for (let i = 0; i < finals.length; i++) {
      let checkData = await Count_polda_day.findOne({
        where: {
          polda_id: finals[i].polda_id,
          date: finals[i].date,
        },
      });

      let data = {
        polda_id: finals[i].polda_id,
        date: finals[i].date,
        meninggal_dunia: finals[i].total_md,
        luka_berat: finals[i].total_lb,
        luka_ringan: finals[i].total_lr,
        insiden_kecelakaan: finals[i].total_accident,
        kerugian_material: finals[i].total_materialloss,
        total_korban: finals[i].total_korban,
      };

      if (checkData) {
        await Count_polda_day.update(data, {
          transaction: transaction,
          where: {
            polda_id: finals[i].polda_id,
            date: finals[i].date,
          },
        });
      } else {
        await Count_polda_day.create(data, {
          transaction: transaction,
        });
      }
    }

    await transaction.commit();
    // console.log({
    //   task: "update_polda_day",
    //   massage: "Succsess",
    //   data: getIrsms,
    // });
  } catch (e) {
    await transaction.rollback();
    console.log({ task: "update_polda_day", massage: e.message });
  }
};

const update_polda_month = async () => {
  const transaction = await db.transaction();
  try {
    const startOfMonth = await moment().startOf("month").format("YYYY-MM-DD");
    const endOfMonth = await moment().endOf("month").format("YYYY-MM-DD");
    let allCountPoldaDay = await Polda.findAll({
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
          Sequelize.fn("sum", Sequelize.col("kerugian_material")),
          "kerugian_material",
        ],
      ],
      include: [
        {
          model: Count_polda_day,
          required: false,
          as: "laka_lantas",
          attributes: [],
          where: {
            date: {
              [Op.between]: [startOfMonth, endOfMonth],
            },
          },
        },
      ],
      nest: true,
      subQuery: false,
      raw: true,
    });

    for (let i = 0; i < allCountPoldaDay.length; i++) {
      let checkData = await Count_polda_month.findOne({
        where: {
          polda_id: allCountPoldaDay[i].id,
          date: startOfMonth,
        },
      });

      let data = {
        polda_id: allCountPoldaDay[i].id,
        meninggal_dunia: allCountPoldaDay[i].meninggal_dunia,
        luka_berat: allCountPoldaDay[i].luka_berat,
        luka_ringan: allCountPoldaDay[i].luka_ringan,
        kerugian_material: allCountPoldaDay[i].kerugian_material,
        total_korban: allCountPoldaDay[i].total_korban,
        insiden_kecelakaan: allCountPoldaDay[i].insiden_kecelakaan,
        date: startOfMonth,
      };

      if (checkData) {
        await Count_polda_month.update(data, {
          transaction: transaction,
          where: {
            polda_id: allCountPoldaDay[i].id,
            date: startOfMonth,
          },
        });
        console.log("update");
      } else {
        await Count_polda_month.create(data, {
          transaction: transaction,
        });
        console.log("insert");
      }
    }

    await transaction.commit();
  } catch (e) {
    await transaction.rollback();
    console.log({ task: "update_polda_month", massage: e.message });
  }
};
