const cron = require("node-cron");
const db = require("../config/database");
const moment = require("moment");

const Count_polda_day = require("../model/count_ranmor_polda_day");
const Count_polda_month = require("../model/count_ranmor_polda_month");

const Polda = require("../model/polda");
const { Op, Sequelize } = require("sequelize");
exports.cronRanmor = () => {
  const scheduledJobFunction = cron.schedule(" */1 * * * *", () => {
    console.log("Cron ranmor is running");
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
          Sequelize.fn("sum", Sequelize.col("mobil_penumpang")),
          "mobil_penumpang",
        ],
        [Sequelize.fn("sum", Sequelize.col("mobil_barang")), "mobil_barang"],
        [Sequelize.fn("sum", Sequelize.col("mobil_bus")), "mobil_bus"],
        [Sequelize.fn("sum", Sequelize.col("ransus")), "ransus"],
        [Sequelize.fn("sum", Sequelize.col("sepeda_motor")), "sepeda_motor"],
      ],
      include: [
        {
          model: Count_polda_day,
          required: false,
          as: "ranmor",
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
        mobil_penumpang: allCountPoldaDay[i].mobil_penumpang,
        mobil_barang: allCountPoldaDay[i].mobil_barang,
        mobil_bus: allCountPoldaDay[i].mobil_bus,
        ransus: allCountPoldaDay[i].ransus,
        sepeda_motor: allCountPoldaDay[i].sepeda_motor,
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
