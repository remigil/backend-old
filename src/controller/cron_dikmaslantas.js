const cron = require("node-cron");
const db = require("../config/database");
const moment = require("moment");

const Master_dikmaslantas = require("../model/input_dikmaslantas");
const Count_polda_day = require("../model/count_dikmaslantas_polda_day");
const Count_polda_month = require("../model/count_dikmaslantas_polda_month");
const Count_polres_month = require("../model/count_dikmaslantas_polres_month");
const Polda = require("../model/polda");
const { Op, Sequelize } = require("sequelize");
exports.cronDikmaslantas = () => {
  const scheduledJobFunction = cron.schedule(" */1 * * * *", () => {
    console.log("Cron dikmaslantas is running");
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
        [
          Sequelize.fn("sum", Sequelize.col("media_elektronik")),
          "media_elektronik",
        ],
        [Sequelize.fn("sum", Sequelize.col("media_sosial")), "media_sosial"],
        [Sequelize.fn("sum", Sequelize.col("media_cetak")), "media_cetak"],
        [Sequelize.fn("sum", Sequelize.col("laka_langgar")), "laka_langgar"],
      ],
      include: [
        {
          model: Count_polda_day,
          required: false,
          as: "dikmaslantas",
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
        media_cetak: allCountPoldaDay[i].media_cetak,
        media_elektronik: allCountPoldaDay[i].media_elektronik,
        media_sosial: allCountPoldaDay[i].media_sosial,
        laka_langgar: allCountPoldaDay[i].laka_langgar,
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