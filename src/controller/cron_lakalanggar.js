const cron = require("node-cron");
const db = require("../config/database");
const moment = require("moment");

const Master_lakalanggar = require("../model/input_laka_langgar");
const Count_polda_day = require("../model/count_lakalanggar_polda_day");
const Count_polda_month = require("../model/count_lakalanggar_polda_month");
const Count_polres_month = require("../model/count_lakalanggar_polres_month");
const Polda = require("../model/polda");
const { Op, Sequelize } = require("sequelize");
exports.cronLakalanggar = () => {
  const scheduledJobFunction = cron.schedule(" */1 * * * *", () => {
    console.log("Cron lakalanggar is running");
    update_polda_month();
  });

  scheduledJobFunction.start();
};

const update_polda_month = async () => {
  try {
    const transaction = await db.transaction();

    const startOfMonth = moment().startOf("month").format("YYYY-MM-DD");
    const endOfMonth = moment().endOf("month").format("YYYY-MM-DD");
    let allCountPoldaDay = await Polda.findAll({
      group: ["polda.id"],
      attributes: [
        "id",
        "name_polda",
        [Sequelize.fn("sum", Sequelize.col("statis")), "statis"],
        [Sequelize.fn("sum", Sequelize.col("mobile")), "mobile"],
        [Sequelize.fn("sum", Sequelize.col("online")), "online"],
        [Sequelize.fn("sum", Sequelize.col("posko")), "posko"],
        [Sequelize.fn("sum", Sequelize.col("preemtif")), "preemtif"],
        [Sequelize.fn("sum", Sequelize.col("preventif")), "preventif"],
        [Sequelize.fn("sum", Sequelize.col("odol_227")), "odol_227"],
        [Sequelize.fn("sum", Sequelize.col("odol_307")), "odol_307"],
      ],
      include: [
        {
          model: Count_polda_day,
          required: false,
          as: "laka_langgar",
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
        statis: allCountPoldaDay[i].statis,
        mobile: allCountPoldaDay[i].mobile,
        online: allCountPoldaDay[i].online,
        posko: allCountPoldaDay[i].posko,
        preemtif: allCountPoldaDay[i].preemtif,
        preventif: allCountPoldaDay[i].preventif,
        odol_227: allCountPoldaDay[i].odol_227,
        odol_307: allCountPoldaDay[i].odol_307,
        date: startOfMonth,
      };

      if (checkData) {
        let updateData = await Count_polda_month.update(data, {
          where: {
            polda_id: allCountPoldaDay[i].id,
            date: startOfMonth,
          },
        });
        console.log("update");
      } else {
        let insertData = await Count_polda_month.create(data);
        console.log("insert");
      }
    }
  } catch (error) {
    console.log(error);
  }
};
