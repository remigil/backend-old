const cron = require("node-cron");
const db = require("../config/database");
const moment = require("moment");

const Master_garlantas = require("../model/input_lapMasyarakat");
const Count_polda_day = require("../model/count_lapMasyarakat_polda_day");
const Count_polda_month = require("../model/count_lapMasyarakat_polda_month");
const Count_polres_month = require("../model/count_lapMasyarakat_polres_month");
const Polda = require("../model/polda");
const { Op, Sequelize } = require("sequelize");
exports.cronLapmasyarakat = () => {
  const scheduledJobFunction = cron.schedule(" */1 * * * *", () => {
    console.log("Cron laporan masyarakat is running");
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
        [Sequelize.fn("sum", Sequelize.col("tegur_prokes")), "tegur_prokes"],
        [Sequelize.fn("sum", Sequelize.col("masker")), "masker"],
        [Sequelize.fn("sum", Sequelize.col("sosial_prokes")), "sosial_prokes"],
        [Sequelize.fn("sum", Sequelize.col("baksos")), "baksos"],
      ],
      include: [
        {
          model: Count_polda_day,
          required: false,
          as: "lapMasyarakat",
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
        tegur_prokes: allCountPoldaDay[i].tegur_prokes,
        masker: allCountPoldaDay[i].masker,
        sosial_prokes: allCountPoldaDay[i].sosial_prokes,
        baksos: allCountPoldaDay[i].baksos,
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
