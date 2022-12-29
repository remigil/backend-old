const cron = require("node-cron");
const db = require("../config/database");
const moment = require("moment");


const Count_polda_day = require("../model/count_penyebaran_polda_day");
const Count_polda_month = require("../model/count_penyebaran_polda_month");

const Polda = require("../model/polda");
const { Op, Sequelize } = require("sequelize");
exports.cronPenyebaran = () => {
  const scheduledJobFunction = cron.schedule(" */1 * * * *", () => {
    console.log("Cron penyebaran is running");
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
        [Sequelize.fn("sum", Sequelize.col("spanduk")), "spanduk"],
        [Sequelize.fn("sum", Sequelize.col("leaflet")), "leaflet"],
        [Sequelize.fn("sum", Sequelize.col("stiker")), "stiker"],
        [Sequelize.fn("sum", Sequelize.col("billboard")), "billboard"],
        [Sequelize.fn("sum", Sequelize.col("jemensosprek")), "jemensosprek"],
      ],
      include: [
        {
          model: Count_polda_day,
          required: false,
          as: "penyebaran",
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
        spanduk: allCountPoldaDay[i].spanduk,
        leaflet: allCountPoldaDay[i].leaflet,
        stiker: allCountPoldaDay[i].stiker,
        billboard: allCountPoldaDay[i].billboard,
        jemensosprek: allCountPoldaDay[i].jemensosprek,
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
